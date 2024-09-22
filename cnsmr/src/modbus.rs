include!(concat!(env!("OUT_DIR"), "/modbus.rs"));

use crate::{
    prometheus::{self, Label, Sample, TimeSeries},
    serial_store::SerialNumberStore,
    supabase::DEVICES,
    ARGS,
};
use anyhow::Result;
use async_nats::jetstream::{consumer, AckKind};
use futures::TryStreamExt;
use metrics::increment_counter;
use prost::Message;
use std::{collections::HashMap, time::Duration};
use tokio::sync::RwLock;

lazy_static::lazy_static! {
    static ref SERIAL_STORE: RwLock<SerialNumberStore> = RwLock::new(SerialNumberStore::new());
}

pub async fn from_frame(
    frame: &Frame,
    org_id: &str,
    machine_id: &str,
    hub_id: &str,
) -> Result<Vec<TimeSeries>> {
    let mut timeseries: Vec<TimeSeries> = Vec::new();

    // get timestamp from source data
    let t = frame.time.as_ref().unwrap();
    let seconds = Duration::from_secs(t.seconds as u64);
    let nanos = Duration::from_nanos(t.nanos as u64);
    let time = (seconds + nanos).as_millis() as i64;

    let product_manufacturer = frame.product_manufacturer.replace(' ', "_").to_lowercase();
    let product_name = frame.product_name.replace(' ', "_").to_lowercase();
    let register_name = frame.register_name.replace(' ', "_").to_lowercase();

    let labels: Vec<Label> = vec![
        Label {
            name: "__name__".to_string(),
            value: format!(
                "{}_{}_{}",
                product_manufacturer, product_name, register_name
            ),
        },
        Label {
            name: "org".to_string(),
            value: org_id.to_string(),
        },
        Label {
            name: "machine".to_string(),
            value: machine_id.to_string(),
        },
        Label {
            name: "hub".to_string(),
            value: hub_id.to_string(),
        },
        Label {
            name: "interface".to_string(),
            value: frame.interface.clone(), // TODO - make this line up with the canbus way of doing it
        },
    ];

    timeseries.push(TimeSeries {
        labels,
        samples: vec![Sample {
            value: frame.data,
            timestamp: time,
        }],
        exemplars: vec![],
    });

    Ok(timeseries)
}

pub async fn task() -> Result<()> {
    let nats = async_nats::connect(&ARGS.nats_url).await?;
    let js = async_nats::jetstream::new(nats);

    let stream = js.get_stream("telemetry_ingest").await?;
    let consumer: consumer::PullConsumer = stream.get_consumer("cnsmr_modbus").await.unwrap();

    loop {
        log::info!("Processing...");

        let mut messages = consumer.batch().max_messages(1000).messages().await?;

        let mut streams = HashMap::<String, Vec<TimeSeries>>::new();

        while let Ok(Some(message)) = messages.try_next().await {
            increment_counter!("cnsmr_ingest_modbus_frames_total");

            // subject is of the form `ingest.canbus.<machine-id>`
            let subject_path: Vec<&str> = message.subject.split(".").collect();
            let machine_id = subject_path[2];

            let device = &DEVICES
                .read()
                .await
                .clone()
                .into_iter()
                .find(|d| d.hub.machine_id == machine_id);

            let org_id = match device {
                Some(d) => d.org.id.to_string(),
                None => "unknown".to_string(),
            };

            let hub_id = match device {
                Some(d) => d.hub.id.to_string(),
                None => "unknown".to_string(),
            };

            let mut frame = Frame::default();

            match frame.merge(message.payload.clone()) {
                Ok(_) => {}
                Err(e) => {
                    log::error!("Got deserialisation error: {e}");
                    let _ = message.ack_with(AckKind::Ack).await;
                    increment_counter!("cnsmr_ingest_canbus_frames_failed");
                    continue;
                }
            };

            let mut series = match from_frame(&frame, &org_id, &machine_id, &hub_id).await {
                Ok(s) => s,
                Err(e) => {
                    log::error!("Failed to deserialize frame: {e:?}");
                    let _ = message.ack_with(AckKind::Ack).await;
                    continue;
                }
            };

            let org_key = match device {
                Some(d) => d.key.to_string(),
                None => "anonymous".to_string(),
            };

            if let Some(stream) = streams.get_mut(&org_key) {
                stream.append(&mut series);
            } else {
                streams.insert(org_key, series);
            }

            let _ = message.ack().await;
        }

        for (org_key, stream) in streams {
            //println!("{:?}", stream);

            match prometheus::push(&ARGS.mimir_url, &org_key, stream).await {
                Ok(_) => {}
                Err(e) => log::error!("Failed to push to Mimir: {e}"),
            }
        }
    }
}
