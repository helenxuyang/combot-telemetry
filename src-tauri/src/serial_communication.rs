use crate::message_parser::TelemetryMessage::{self, DataMessage};
use crate::telemetry_session::AppState;
use crate::{csv_writer, message_parser, telemetry_session};
use serde::Serialize;
use serialport::SerialPortType::UsbPort;
use std::time::Duration;
use tauri::Manager;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio_serial::SerialPortBuilderExt;

#[derive(Serialize)]
pub struct SerializableSerialPortInfo {
    name: String,
    product: Option<String>,
}

#[tauri::command]
pub fn get_serial_ports() -> Result<Vec<SerializableSerialPortInfo>, String> {
    match tokio_serial::available_ports() {
        Ok(ports) => Ok(ports
            .into_iter()
            .map(|p| SerializableSerialPortInfo {
                name: p.port_name,
                product: {
                    match p.port_type {
                        UsbPort(info) => info.product,
                        _ => None,
                    }
                },
            })
            .collect()),
        Err(e) => Err(format!("Failed to list available ports: {}", e)),
    }
}

#[tauri::command]
pub async fn read_serial(app: AppHandle, port: String) {
    let serial_port = tokio_serial::new(port, 115200)
        .open_native_async()
        .expect("Failed to open serial port");

    telemetry_session::handle_start(&app);

    let mut serial_reader = BufReader::new(serial_port);

    let app_clone = app.clone();

    // read from serial, write to CSV
    tokio::task::spawn(async move {
        loop {
            let mut line = String::new();
            let num_bytes = serial_reader.read_line(&mut line).await;
            match num_bytes {
                Ok(num) => {
                    if num > 0 {
                        let raw_message = line.trim_end().to_string();
                        if let Err(error) = csv_writer::write_raw_messages_txt(&app, &raw_message) {
                            println!("CSV ERROR: Failed to write raw data: {}", error);
                        };
                        println!("raw: {:?}", raw_message);

                        let parsed_message = message_parser::parse_message(raw_message, &app);

                        let state = app.state::<AppState>();
                        let last_messages_guard = state.last_messages.write();
                        if let Ok(mut last_messages) = last_messages_guard {
                            match &parsed_message {
                                TelemetryMessage::DataMessage(data) => {
                                    let esc_id = data.esc_id;
                                    last_messages.insert(esc_id, parsed_message.clone());
                                }
                                TelemetryMessage::ErrorMessage(data) => {
                                    let esc_id = data.esc_id;
                                    last_messages.insert(esc_id, parsed_message.clone());
                                }
                                TelemetryMessage::UnknownMessage(_) => {
                                    last_messages.insert(4, parsed_message.clone());
                                    // TODO: do something less cursed
                                }
                            }
                        }
                    }
                }
                Err(err) => {
                    println!("SERIAL ERROR: Failed to read line: {}", err)
                }
            }
        }
    });

    // parse and send to frontend
    tokio::task::spawn(async move {
        let duration = Duration::from_millis(10);
        let mut interval = tokio::time::interval(duration);
        loop {
            interval.tick().await;

            let state = app_clone.state::<AppState>();
            let last_messages_guard = state.last_messages.write();
            if let Ok(mut last_messages) = last_messages_guard {
                let msgs: Vec<TelemetryMessage> = last_messages.values().cloned().collect();
                if let Err(error) = app_clone.emit("telemetry-message", msgs) {
                    println!("GUI ERROR: Failed to emit telemetry-message: {}", error);
                }
                last_messages.clear();
            }
        }
    });
}
