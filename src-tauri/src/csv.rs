use crate::parser::TelemetryMessage;
use crate::session::AppState;
use chrono::DateTime;
use chrono::Local;
use std::fs::OpenOptions;
use std::io::Write;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub fn get_formatted_time(start_date_time: DateTime<Local>) -> String {
    let formatted_date_time = start_date_time.format("%m-%d_%H-%M-%S").to_string();
    return formatted_date_time;
}

pub fn write_raw_messages_txt(
    app: &AppHandle,
    raw_message: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let state = app.state::<Mutex<AppState>>();
    let state_mutex = state.lock().unwrap();
    let start_time = state_mutex.session_start_time;

    if let Some(time) = start_time {
        let formatted_time = get_formatted_time(time);
        let file_name = format!("{formatted_time}_raw_log.txt");
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

pub fn write_parsed_messages_csv(
    app: &AppHandle,
    message: TelemetryMessage,
) -> Result<(), Box<dyn std::error::Error>> {
    let state = app.state::<Mutex<AppState>>();
    let state_mutex = state.lock().unwrap();
    let start_time = state_mutex.session_start_time;

    if let Some(time) = start_time {
        let formatted_time = get_formatted_time(time);
        let file_name = format!("{formatted_time}_log.csv");
        let file = OpenOptions::new()
            .write(true)
            .create(true)
            .append(true)
            .open(file_name);
        if let Ok(f) = file {
            let mut writer = csv::WriterBuilder::new().has_headers(false).from_writer(f);
            writer.serialize(message)?;
            writer.flush()?;
        }
    }

    Ok(())
}
