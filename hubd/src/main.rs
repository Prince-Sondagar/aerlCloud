mod args;
mod auth;
#[cfg(feature = "canbus")]
mod canbus;
mod heartbeat;
#[cfg(feature = "modbus")]
mod modbus;
mod state;
#[cfg(feature = "web")]
mod web;
mod ingest;

#[macro_use]
extern crate serde;

use anyhow::Result;
use args::Args;
use clap::Parser;
use std::future;
use tokio::select;

lazy_static::lazy_static! {
    static ref ARGS: Args = Args::parse();
}

#[tokio::main]
async fn main() -> Result<()> {
    // load logger
    env_logger::Builder::new()
        .filter_level(ARGS.log_level)
        .init();

    // load firmware if needed
    #[cfg(feature = "canbus")]
    canbus::bootload::run().await;

    // get initial auth token
    auth::refresh_token().await?;
    log::info!("Completed inital auth token refresh.");

    // Start webui
    #[cfg(feature = "web")]
    tokio::spawn(web::run());

    // start event loop tasks
    select! {
        e = heartbeat::task() => log::error!("Heartbeat task stopped: {:?}", e),
        e = auth::task() => log::error!("Auth task stopped: {:?}", e),

        e = {
            #[cfg(feature = "modbus")]
            let a = modbus::task();
            #[cfg(not(feature = "modbus"))]
            let a = future::pending();
            a
        } => log::error!("modbus task stopped: {:?}", e),

        e = {
            #[cfg(feature = "canbus")]
            let a = canbus::task();
            #[cfg(not(feature = "canbus"))]
            let a = future::pending();
            a
        } => log::error!("CAN bus task stopped: {:?}", e),
    };
    // if any of the tasks end (i.e. they have an unrecoverable error)

    log::error!("Exiting");

    Ok(())
}
