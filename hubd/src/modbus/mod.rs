mod db;
pub mod device;
pub mod interface;
pub mod product;

use crate::modbus::db::{Device, DB};
use crate::ingest::Ingest;
use crate::ARGS;
use self::device::{build_context, read_register};
use self::interface::Interface;
use std::time::{Duration, SystemTime};
use tokio_modbus::prelude::*;
use anyhow::{anyhow, Result};
use core::result::Result::Ok;
use tokio_modbus::client::Context;

include!(concat!(env!("OUT_DIR"), "/modbus.rs"));

/// modbus event loop task
pub async fn task() -> Result<()> {
    let ingest = Ingest::new(format!("{}/stream/modbus/push", &ARGS.api_url));

    // Wait until modbus config has been received
    let mut devices: Vec<Device>;
    loop {
        match pull_modbus_config().await {
            Ok(config) => {
                devices = config;
                break;
            }
            Err(e) => {
                log::error!("{}", e)
            }
        }
    }

    let mut loop_counter = 0;
    loop {
        if loop_counter == 0 {
            devices = match pull_modbus_config().await {
                Ok(config) => config,
                Err(_) => devices
            }
        };

        // Store the frames from an iteration
        let mut frames: Vec<Frame> = Vec::new();

        for device in devices.iter() {

            // Build modbus context
            let mut ctx = match build_context(&device.modbus_interface.config).await {
              Ok(ctx) => ctx,
              Err(e) => {
                  log::error!("[modbus] Error connecting to tcp modbus: {}", e);
                  continue;
              }
            };

            // Read TCP device
            match read_tcp_device(device, &mut ctx, &mut frames).await {
                Ok(_) => {}
                Err(e) => {
                    log::error!("[modbus] Error reading tcp modbus: {}", e);
                    continue
                },
            };
        }

        // Push frames to boundary
        ingest.push(Payload { frames: frames.clone() }).await;

        loop_counter = (loop_counter + 1) % 60;

        tokio::time::sleep(Duration::from_secs(5)).await;
    }
}

async fn pull_modbus_config() -> Result<Vec<Device>> {
    // Connect to DB
    let connection = DB::new().await?;

    // Query config
    let devices = connection.devices().await?;

    Ok(devices)
}

pub async fn read_tcp_device(
    device: &Device,
    ctx: &mut Context,
    frames: &mut Vec<Frame>,
) -> Result<()> {

    log::debug!("[modbus] Reading Modbus TCP device: {} {} (device id = {})",
        device.modbus_product.manufacturer,
        device.modbus_product.name,
        device.id);

    // Read each register entry
    for register in device.modbus_product.schema.registers.iter() {

        log::debug!("[modbus] Reading Modbus TCP register: {}", register.name);

        // Set the modbus slave id
        match register.slave_id {
            Some(slave_id) => ctx.set_slave(Slave::from(slave_id)),
            None => ctx.set_slave(Slave::tcp_device()),
        }

        // Read registers
        match read_register(ctx, register).await {
            Ok(raw_value) => {
                let scaled_value: f64 = if register.address < 20000 {
                    raw_value
                } else {
                    raw_value * register.factor.unwrap_or(1_f64) + register.offset.unwrap_or(0 as f64)
                };

                let tcp_config = match &device.modbus_interface.config {
                    Interface::Tcp(config) => config,
                    Interface::Rtu(_) => {return Err(anyhow!("Cannot read an RTU register from `read_tcp_device`"))}
                };

                // Put value in a frame
                let frame = Frame {
                    time: Some(SystemTime::now().into()),
                    device_id: device.id as u32,
                    product_id: device.modbus_product.id as u32,
                    product_manufacturer: device.modbus_product.manufacturer.clone(),
                    product_name: device.modbus_product.name.clone(),
                    register_name: register.name.clone(),
                    data: scaled_value,
                    interface: format!("modbus,tcp,{0}:{1}", tcp_config.address, tcp_config.port),
                };

                frames.push(frame);
            }
            Err(e) => {
                log::error!("{}", e)
            }
        };
    }

    ctx.disconnect().await?;

    Ok(())
}
