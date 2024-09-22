use crate::canbus::{self, identifier::AerlIdentifier};
use crate::ARGS;
use anyhow::{Context, Result};
use socketcan::EmbeddedFrame as _;
use socketcan::Frame as _;
use socketcan::{BlockingCan, CanDataFrame, CanFrame, CanSocket, Socket, StandardId};
use std::process;
use std::thread;
use std::time::{Duration, Instant};
use tokio::time::sleep;
use std::fs::File;
use std::io::{self, Read};

/// Protection key used to unlock the bootloader.
/// Not particularly secret since it's sent in the clear clear over the wire.
const PROTECTION_KEY: &[u8] = &[0xEF, 0x73, 0xBD, 0xA3];

/// CAN bus command message identifiers
enum CommandMessage {
    Restart = 23,
    /// Shutdown charger output.
    Shutdown = 24,
    /// Enter into the bootloader.
    Begin = 26,
    /// Upload 4 bytes of data to a given address.
    Upload = 27,
    /// Finish loading.
    End = 28,
    /// Erase firmware.
    Erase = 29,
}

/// CAN bus response message identifiers
enum ResponseMessage {
    /// Ack
    Ack = 6,
}

pub async fn load(socket: &mut CanSocket, serial_number: &str, firmware_binary: &Vec<u8>) -> Result<()> {
    let serial_number: u32 = serial_number.parse()?;

    shutdown(socket);

    begin(socket, serial_number)?;

    upload(socket, firmware_binary)?;

    end(socket)?;

    Ok(())
}

pub async fn load_range(serial_start: i32, serial_end: i32, firmware_binary: &Vec<u8>) -> Result<()> {
    for i in serial_start..(serial_end + 1) {
        // Open socket
        let mut socket = CanSocket::open("can0")?;

        let mut serial_number = i.to_string();
        println!("Attempting to upload firmware to serial #{}", serial_number);
        load(&mut socket, serial_number.as_str(), firmware_binary).await?;

        // Close socket
        drop(socket);

        // sleep before next unit
        let sleep_duration = Duration::from_secs(2);
        sleep(sleep_duration).await;
    }
    Ok(())
}

pub fn shutdown(socket: &mut CanSocket) -> Result<()> {
    let id = AerlIdentifier {
        message: CommandMessage::Shutdown as u8,
        device: 0,
    };

    let frame = CanFrame::new(StandardId::new(id.into()).unwrap(), &[]).unwrap();

    socket.transmit(&frame)?;

    Ok(())
}

pub async fn reset(socket: &mut CanSocket) -> Result<()> {
    let id = AerlIdentifier {
        message: CommandMessage::Restart as u8,
        device: 0,
    };

    let mut data = Vec::new();
    data.extend_from_slice("ALL".as_bytes());

    let frame = CanFrame::new(StandardId::new(id.into()).unwrap(), &data).unwrap();

    socket.transmit(&frame)?;

    Ok(())
}

pub fn begin(socket: &mut CanSocket, serial_number: u32) -> Result<()> {
    let id = AerlIdentifier {
        message: CommandMessage::Begin as u8,
        device: 0,
    };

    let mut data = Vec::new();
    data.extend_from_slice(PROTECTION_KEY);
    data.extend_from_slice(&serial_number.to_le_bytes());

    let frame = CanFrame::new(StandardId::new(id.into()).unwrap(), &data).unwrap();

    socket.transmit(&frame)?;

    Ok(())
}

pub fn upload(socket: &mut CanSocket, binary: &[u8]) -> Result<()> {
    let mut index: usize = 0;
    let length = binary.len(); // index by word

    log::info!("Beginning Firmware Upload");

    while index < length {
        let id = AerlIdentifier {
            message: CommandMessage::Upload as u8,
            device: 0,
        };

        let mut data: Vec<u8> = Vec::new();
        data.extend((index as u32).to_le_bytes());
        data.push(binary[index + 0]);
        data.push(binary[index + 1]);
        data.push(binary[index + 2]);
        data.push(binary[index + 3]);

        let frame = CanFrame::new(StandardId::new(id.into()).unwrap(), &data).unwrap();

        socket.transmit(&frame)?;

        //log::info!("Sent frame to device");

        let mut acked = false;
        let timeout_duration = Duration::new(20, 0);
        let retry_duration = Duration::new(4, 0);
        let start_time = Instant::now();
        let mut last_log_time = Instant::now();
        while !acked {
            // If no ack is recieved for 20 seconds, give up.
            if start_time.elapsed() > timeout_duration {
                log::warn!(
                    "Timeout: No acknowledgment received within 20 seconds for update packet {}",
                    index
                );

                return Ok(());
            }

            // No ack has been recieved for 4 seconds, try sending the packet again:
            if last_log_time.elapsed() >= retry_duration {
                log::warn!("No ack in 4 seconds... Retrying last packet");
                last_log_time = Instant::now(); // Reset the last log time
                socket.transmit(&frame)?;
            }

            let frame = socket.receive()?;

            match frame.id() {
                socketcan::Id::Standard(id) => {
                    let id = AerlIdentifier::from(id.as_raw());

                    if id.message == ResponseMessage::Ack as u8 {
                        //log::info!("Got ack.");
                        acked = true;
                    }
                }
                _ => {}
            }
        }

        if index % 512 == 0 {
            log::info!("Firmware Upload {}% complete", index * 100 / length);
        }

        index += 4;
    }

    log::info!("Finished uploading firmware.");

    Ok(())
}

pub fn end(socket: &mut CanSocket) -> Result<()> {
    let id = AerlIdentifier {
        message: CommandMessage::End as u8,
        device: 0,
    };

    let frame = CanFrame::new(StandardId::new(id.into()).unwrap(), &[]).unwrap();

    socket.transmit(&frame)?;

    Ok(())
}

fn read_firmware_binary(path: &String) -> io::Result<Vec<u8>> {
    let mut file = File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    Ok(buffer)
}

pub async fn run() -> Result<()> {
    if let Some(args) = ARGS.load_firmware_serial.clone() {

        let firmware_binary = read_firmware_binary(&args[1])
            .context("Error reading the firmware file.")
            .unwrap();

        let mut socket = CanSocket::open("can0")?;
        canbus::bootload::load(&mut socket, &args[0], &firmware_binary).await?;

        log::info!("Upload complete");
        process::exit(0);
    }

    if let Some(args) = ARGS.load_firmware_serial_range.clone() {
        let parts: Vec<&str> = args[0].split(':').collect();
        if parts.len() != 2 {
            return panic!("Input must be in the format 'start:end'");
        }

        let start = parts[0].parse::<i32>().unwrap();
        let end = parts[1].parse::<i32>().unwrap();

        let firmware_binary = read_firmware_binary(&args[1])
            .context("Error reading the firmware file.")
            .unwrap();

        canbus::bootload::load_range(start, end, &firmware_binary).await?;

        log::info!("Upload complete");
        process::exit(0);
    }

    if ARGS.reset {
        let mut socket = CanSocket::open("can0")?;
        reset(&mut socket).await?;
        log::info!("`RESET ALL` packet sent");
        process::exit(0);
    }

    Ok(())
}
