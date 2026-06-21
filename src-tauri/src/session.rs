use crate::csv;
use crate::parser;
use chrono::{DateTime, Local};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

pub struct AppState {
    pub session_start_time: Option<DateTime<Local>>,
}

pub fn handle_start(app: &AppHandle) {
    let date_time = Local::now();

    let state = app.state::<Mutex<AppState>>();
    let mut state_mutex = state.lock().unwrap();
    state_mutex.session_start_time = Some(date_time);
}

// TODO: figure out async tokio stuff to do these in "parallel"?
pub fn handle_message(app: &AppHandle, raw_message: String) {
    // save raw to txt
    if let Err(error) = csv::write_raw_messages_txt(&app, &raw_message) {
        println!("CSV ERROR: Failed to write raw data: {}", error);
    };

    // parse and send to frontend
    let parsed_message = parser::parse_message(raw_message);
    if let Err(error) = app.emit("telemetry-message", &parsed_message) {
        println!("GUI ERROR: Failed to emit telemetry-message: {}", error);
    }

    // save parsed to CSV
}
