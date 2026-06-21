use crate::session::AppState;
use chrono::DateTime;
use chrono::Local;
use std::fs::OpenOptions;
use std::io::Write;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub fn get_raw_messages_txt_name(start_date_time: DateTime<Local>) -> String {
    let formatted_date_time = start_date_time.format("%m-%d_%H-%M-%S").to_string();
    return format!("{formatted_date_time}.txt");
}

pub fn write_raw_messages_txt(
    app: &AppHandle,
    raw_message: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let state = app.state::<Mutex<AppState>>();
    let state_mutex = state.lock().unwrap();
    let start_time = state_mutex.session_start_time;

    if let Some(time) = start_time {
        let file_name = get_raw_messages_txt_name(time);
        let file = OpenOptions::new()
            .write(true)
            .create(true)
            .append(true)
            .open(file_name);
        if let Ok(mut f) = file {
            writeln!(&mut f, "{}", raw_message)?;
        }
    }

    Ok(())
}
