use crate::message_parser::TelemetryMessage;
use crate::robot_config::RobotConfig;
use chrono::{DateTime, Local};
use std::collections::HashMap;
use std::sync::RwLock;
use tauri::{AppHandle, Manager};

pub struct AppState {
    pub session_start_time: RwLock<Option<DateTime<Local>>>,
    pub robot_config: RwLock<Option<RobotConfig>>,
    pub serial_task_handle: RwLock<Option<tokio::task::JoinHandle<()>>>,
    pub last_messages: RwLock<HashMap<u8, TelemetryMessage>>,
}

pub fn handle_start(app: &AppHandle) {
    let date_time = Local::now();
    let state = app.state::<AppState>();
    let session_start_time_lock = state.session_start_time.write();
    if let Ok(mut lock) = session_start_time_lock {
        *lock = Some(date_time);
    }
}
