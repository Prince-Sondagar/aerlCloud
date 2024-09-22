use super::{
    interface::Interface,
    product::{Register, RegisterEndianness},
};
use crate::modbus::product::RegisterValueType;
use anyhow::{anyhow, ensure, Result};
use bitter::{BigEndianReader, BitReader, LittleEndianReader};
use tokio_modbus::{
    client::{tcp, Context}
};
use std::net::SocketAddr;


/// Build a connection context from an interface.
pub async fn build_context(interface: &Interface) -> Result<Context> {
    Ok(match interface {
        Interface::Tcp(tcp_config) => {
            let socket_addr: SocketAddr = SocketAddr::new(
                std::net::IpAddr::V4(tcp_config.address),
                u16::from(tcp_config.port),
            );

            tcp::connect(socket_addr).await?
        }
        Interface::Rtu(_i) => {
            return Err(anyhow!("RTU not supported yet"))
        }
    })
}

/// Read a single value from a given register address with the provided connection context.
pub async fn read_register(ctx: &mut Context, register: &Register) -> Result<f64> {
    use tokio_modbus::prelude::*;

    let address = register.address as u16;
    let register_quantity: u16 = match register.value_type {
        RegisterValueType::Bool => 1_u16,
        RegisterValueType::U16 => 1_u16,
        RegisterValueType::I16 => 1_u16,
        RegisterValueType::U32 => 2_u16,
        RegisterValueType::I32 => 2_u16,
        RegisterValueType::F32 => 2_u16
    };

    let result: Vec<u16> = if address <= 9999 {
        match ctx.read_coils(address, register_quantity).await {
            Ok(v) => v.into_iter().map(|x| x as u16).collect(),
            Err(e) => {
                return Err(anyhow!("Failed to read coil register {}: {}", address, e));
            }
        }
    } else if address >= 10000 && address <= 19999 {
        match ctx.read_discrete_inputs(address - 10000, register_quantity).await {
            Ok(v) => v.into_iter().map(|x| x as u16).collect(),
            Err(e) => {
                return Err(anyhow!(
                    "Failed to read discrete input register {}: {}",
                    address,
                    e
                ));
            }
        }
    } else if address >= 30000 && address <= 39999 {
        match ctx.read_input_registers(address - 30000, register_quantity).await {
            Ok(v) => v.into_iter().map(|x| x as u16).collect(),
            Err(e) => {
                return Err(anyhow!("Failed to read input register {}: {}", address, e));
            }
        }
    } else if address >= 40000 && address <= 49999 {
        match ctx.read_holding_registers(address - 40000, register_quantity).await {
            Ok(v) => v.into_iter().map(|x| x as u16).collect(),
            Err(e) => {
                return Err(anyhow!(
                    "Failed to read holding register {}: {}",
                    address,
                    e
                ));
            }
        }
    } else {
        return Err(anyhow!("Register {} not handled.", address));
    };

    // Parse the bits
    let value = process_modbus(result, register)?;

    Ok(value)
}

fn process_packet(bits: Vec<u16>) -> Vec<u8> {
    let mut bit_buffer: Vec<u8> = Vec::new();

    for word in bits.iter() {
        // Note: We swap the bits here as per the modbus specs
        let right = (*word & 0b0000000011111111) as u8;
        let left = (*word >> 8) as u8;

        bit_buffer.push(right);
        bit_buffer.push(left);
    }

    bit_buffer
}

fn process_modbus(mut words: Vec<u16>, register: &Register) -> Result<f64> {

    // 1. do we need to swap the words?
    if register.word_swap {
        // Note this implementation only makes sense if there are 2 words (i.e 32bits).
        // I am yet to see anything bigger in the wild but if something comes
        // up this will need to be changed.
        words.reverse()
    }

    // 2. Convert vec<u16> to vec<u8>
    let bytes = process_packet(words);

    // 3. Little or big endian?
    let mut reader: Box<dyn BitReader> = match register.endianness {
        RegisterEndianness::Little => Box::new(LittleEndianReader::new(&bytes)),
        RegisterEndianness::Big => Box::new(BigEndianReader::new(&bytes)),
    };

    // Parse bits as a value
    let value: f64 = match register.value_type {
        RegisterValueType::Bool => {
            ensure!(bytes.len() >= 2, "Error parsing boolean value");
            bytes[1] as f64
        }
        RegisterValueType::U16 => {
            let value = reader.read_u16().unwrap();
            value as f64
        }
        RegisterValueType::I16 => {
            let value = reader.read_i16().unwrap();
            value as f64
        }
        RegisterValueType::U32 => {
            let value = reader.read_u32().unwrap();
            value as f64
        }
        RegisterValueType::I32 => {
            let value = reader.read_i32().unwrap();
            value as f64
        }
        RegisterValueType::F32 => {
            let value = reader.read_f32().unwrap();
            value as f64
        }
    };

    Ok(value)
}
