use crate::csv_writer;
use crate::message_parser;
use crate::robot_config::RobotConfig;
use chrono::{DateTime, Local};
use std::sync::RwLock;
use tauri::{AppHandle, Emitter, Manager};

pub struct AppState {
    pub session_start_time: RwLock<Option<DateTime<Local>>>,
    pub robot_config: RwLock<Option<RobotConfig>>,
}

pub fn handle_start(app: &AppHandle) {
    let date_time = Local::now();
    let state = app.state::<AppState>();
    let session_start_time_lock = state.session_start_time.write();
    if let Ok(mut lock) = session_start_time_lock {
        *lock = Some(date_time);
    }
}

// TODO: figure out async tokio stuff to do these in "parallel"?
pub fn handle_message(app: &AppHandle, raw_message: String) {
    // save raw to txt
    if let Err(error) = csv_writer::write_raw_messages_txt(&app, &raw_message) {
        println!("CSV ERROR: Failed to write raw data: {}", error);
    };

    // parse
    let parsed_message = message_parser::parse_message(raw_message, &app);

    // send to frontend
    if let Err(error) = app.emit("telemetry-message", &parsed_message) {
        println!("GUI ERROR: Failed to emit telemetry-message: {}", error);
    }

    // save parsed to CSV
    // if let Err(error) = csv_writer::write_parsed_messages_csv(&app, parsed_message) {
    //     println!("CSV ERROR: Failed to write parsed data: {}", error);
    // };
}
