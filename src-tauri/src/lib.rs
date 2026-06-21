mod csv;
mod parser;
mod session;
mod websocket;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(session::AppState {
                session_start_time: None,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![websocket::websocket_connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
