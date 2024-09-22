use std::collections::VecDeque;
use std::sync::Arc;
use tokio::time::Duration;
use tokio::sync::mpsc::{self, Receiver, Sender};
use tokio::time::sleep;
use reqwest::Client;
use crate::auth::ACCESS_TOKEN;

pub struct Ingest<T> {
    tx: Sender<T>,
}

impl<T: Send + 'static + Clone + prost::Message> Ingest<T> {
    pub fn new(uri: String) -> Ingest<T> {
        let (tx, rx) = mpsc::channel(32);

        let ingest = Ingest { tx };

        let shared_queue = Arc::new(tokio::sync::Mutex::new(VecDeque::new()));

        // The payload reciever
        let _ = tokio::spawn(Self::queue_payload(rx, shared_queue.clone()));

        // The payload sender
        let _ = tokio::spawn(Self::process_payload(uri.clone(), shared_queue.clone()));

        ingest
    }

    pub async fn push(self: &Self, data: T) {
        let _ = self.tx.send(data).await;
    }

    async fn queue_payload(mut rx: Receiver<T>, shared_queue: Arc<tokio::sync::Mutex<VecDeque<T>>>) {
        while let Some(item) = rx.recv().await {
            let mut queue = shared_queue.lock().await;

            // Hard buffer limit of 50k message
            // roughly 3 days of modbus data at 5 second intervals
            if queue.len() >= 50_000 {
                // Remove oldest payload
                let _ = queue.pop_front();
                log::info!("[ingest] Send buffer is full, discarding older frames to make room")
            }

            log::debug!("[ingest] Enqueing payload data");
            queue.push_back(item);
        }
    }

    async fn process_payload(uri: String, shared_queue: Arc<tokio::sync::Mutex<VecDeque<T>>>) {
        let mut failed_push_attempts = 0;
        let mut push_wait_duration;

        loop {
            let mut item_to_process = None;

            // linear backoff function
            push_wait_duration = 200 + 200 * (failed_push_attempts % 150);

            // Dequeue an item if available
            {
                let mut queue = shared_queue.lock().await;
                if let Some(item) = queue.pop_front() {
                    item_to_process = Some(item);
                }
            }

            // Process the dequeued item
            if let Some(item) = item_to_process {
                let operation_successful = Self::send_payload(&uri, item.clone()).await;

                if operation_successful {
                    failed_push_attempts = 0;
                } else {
                    // Failed to push
                    failed_push_attempts += 1;

                    log::info!("[ingest] failed to push payload to remote {} time(s)... trying again in {} seconds", failed_push_attempts, push_wait_duration/1000);

                    // Enqueue the item again at the back for retry if the operation failed
                    let mut queue = shared_queue.lock().await;
                    queue.push_front(item);

                    // Backoff
                    sleep(Duration::from_millis(push_wait_duration)).await;

                }
            } else {
                // No items to process, so wait for a while before trying to dequeue again
                sleep(Duration::from_millis(200)).await;
            }
        }
    }

    // Dummy implementation, replace with your actual item processing logic
    async fn send_payload(uri: &String, payload: T) -> bool {

        let body = payload.encode_to_vec();

        let req = Client::new()
            .post(uri)
            .header(
                "Authorization",
                format!("Bearer {}", &ACCESS_TOKEN.read().await),
            )
            .body(body);

        let res = match req.send().await {
            Ok(res) => res,
            Err(e) => {
                log::debug!("Error sending request: {}", e);
                return false
            }
        };

        match res.error_for_status() {
            Ok(_) => return true,
            Err(e) => {
                log::debug!("Error sending request: {}", e);
                return false
            },
        }
    }
}
