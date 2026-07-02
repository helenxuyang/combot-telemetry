mod config_manager;
mod csv_importer;
mod csv_writer;
mod message_parser;
mod serial_communication;
mod telemetry_session;
mod websocket;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(telemetry_session::AppState {
                session_start_time: None,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            websocket::websocket_connect,
            csv_importer::parse_raw_file,
            serial_communication::get_serial_ports,
            serial_communication::read_serial
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
