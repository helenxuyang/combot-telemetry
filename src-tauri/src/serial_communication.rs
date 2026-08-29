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
pub async fn read_serial(app: AppHandle, port: String) -> Result<(), String> {
    let serial_port = tokio_serial::new(port, 230400).open_native_async();
    if let Err(error) = serial_port {
        return Err(format!("SERIAL ERROR: failed to open port - {}", error));
    }
    if let Ok(stream) = serial_port {
        telemetry_session::handle_start(&app);
        let mut serial_reader = BufReader::new(stream);

        let app_reader = app.clone();
        let app_emitter = app.clone();

        // read from serial, write to CSV
        let serial_handle = tokio::task::spawn(async move {
            loop {
                let mut line = String::new();
                let num_bytes = serial_reader.read_line(&mut line).await;
                match num_bytes {
                    Ok(num) => {
                        if num > 0 {
                            let raw_message = line.trim_end().to_string();
                            if let Err(error) =
                                csv_writer::write_raw_messages_txt(&app, &raw_message)
                            {
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
        let emitter_handle = tokio::task::spawn(async move {
            let duration = Duration::from_millis(10);
            let mut interval = tokio::time::interval(duration);
            loop {
                interval.tick().await;

                let state = app_emitter.state::<AppState>();
                let last_messages_guard = state.last_messages.write();
                if let Ok(mut last_messages) = last_messages_guard {
                    let msgs: Vec<TelemetryMessage> = last_messages.values().cloned().collect();
                    if let Err(error) = app_emitter.emit("telemetry-message", msgs) {
                        println!("GUI ERROR: Failed to emit telemetry-message: {}", error);
                    }
                    last_messages.clear();
                }
            }
        });

        // save task handles to state to be able to close later
        let state = app_reader.state::<AppState>();
        let serial_task_handle_guard = state.serial_task_handle.write();
        if let Ok(mut serial_task_handle) = serial_task_handle_guard {
            *serial_task_handle = Some(serial_handle);
        }
        let emitter_task_handle_guard = state.emitter_task_handle.write();
        if let Ok(mut emitter_task_handle) = emitter_task_handle_guard {
            *emitter_task_handle = Some(emitter_handle);
        }

        return Ok(());
    }

    return Err("SERIAL ERROR: failed to connect to port".to_string());
}

#[tauri::command]
pub async fn stop_serial(app: AppHandle) {
    let state = app.state::<AppState>();
    let serial_task_handle_guard = state.serial_task_handle.write();
    if let Ok(mut serial_task_handle) = serial_task_handle_guard {
        if let Some(handle) = serial_task_handle.take() {
            handle.abort();
        }
    }
    let emitter_task_handle_guard = state.emitter_task_handle.write();
    if let Ok(mut emitter_task_handle) = emitter_task_handle_guard {
        if let Some(handle) = emitter_task_handle.take() {
            handle.abort();
        }
    }
}
