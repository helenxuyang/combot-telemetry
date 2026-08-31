use crate::message_parser::TelemetryMessage;
use crate::telemetry_session::AppState;
use crate::{csv_writer, message_parser, telemetry_session};
use serial2_tokio::SerialPort;
use tauri::AppHandle;
use tauri::Manager;
use tokio::io::{AsyncBufReadExt, BufReader};

#[tauri::command]
pub fn get_serial_ports() -> Result<Vec<String>, String> {
    SerialPort::available_ports()
        .map(|ports| {
            ports
                .into_iter()
                .map(|port| port.to_string_lossy().into_owned())
                .collect()
        })
        .map_err(|e| format!("Failed to list available ports: {}", e))
}

#[tauri::command]
pub fn get_latest_messages(app: AppHandle) -> Result<Vec<TelemetryMessage>, String> {
    let state = app.state::<AppState>();
    let last_messages_guard = state.last_messages.write();

    if let Ok(mut last_messages) = last_messages_guard {
        let messages: Vec<TelemetryMessage> = last_messages.values().cloned().collect();

        last_messages.clear();

        Ok(messages)
    } else {
        Err("SERIAL ERROR: failed to access latest telemetry messages".to_string())
    }
}

pub fn handle_message(app: AppHandle, raw_message: String) {
    // debug print
    // println!("raw: {}", raw_message);

    // write to CSV
    if let Err(error) = csv_writer::write_raw_messages_txt(&app, &raw_message) {
        println!("CSV ERROR: Failed to write raw data: {}", error);
    }

    // parse
    let parsed_message = message_parser::parse_message(raw_message, &app);

    // save in state
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
            }
        }
    }
}
#[tauri::command]
pub async fn read_serial(app: AppHandle, port: String) -> Result<(), String> {
    let app_stop_serial = app.clone();
    let app_task_handle_writer = app.clone();

    // kill it if it's still active
    stop_serial(app_stop_serial).await;
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    let serial_port = SerialPort::open(&port, 230400);
    let stream = match serial_port {
        Ok(port) => port,
        Err(error) => {
            return Err(format!("SERIAL ERROR: failed to open port - {}", error));
        }
    };

    telemetry_session::handle_start(&app);

    let mut serial_reader = BufReader::new(stream);

    // Read from serial, write to CSV
    let serial_handle = tokio::task::spawn(async move {
        loop {
            let app_message_handler = app.clone();

            let mut line = String::new();
            let num_bytes = serial_reader.read_line(&mut line).await;

            match num_bytes {
                Ok(num) => {
                    if num > 0 {
                        let raw_message = line.trim_end().to_string();
                        handle_message(app_message_handler, raw_message);
                    }
                }

                Err(err) => {
                    println!("SERIAL ERROR: Failed to read line: {}", err);
                }
            }
        }
    });

    // Save task handle to state so it can be closed later
    let state = app_task_handle_writer.state::<AppState>();
    let serial_task_handle_guard = state.serial_task_handle.write();

    if let Ok(mut serial_task_handle) = serial_task_handle_guard {
        *serial_task_handle = Some(serial_handle);
    }

    Ok(())
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
}
