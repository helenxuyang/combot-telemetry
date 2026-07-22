use crate::telemetry_session::AppState;
use chrono::DateTime;
use chrono::Local;
use std::fs::OpenOptions;
use std::io::Write;
use tauri::{AppHandle, Manager};

pub fn get_formatted_time(start_date_time: DateTime<Local>) -> String {
    let formatted_date_time = start_date_time.format("%m-%d_%H-%M-%S").to_string();
    return formatted_date_time;
}

pub fn get_formatted_start_time(app: &AppHandle) -> Option<String> {
    let state = app.state::<AppState>();
    let session_start_time_lock = state.session_start_time.read();
    if let Ok(lock) = session_start_time_lock {
        let session_start_time = *lock;
        return session_start_time.map(get_formatted_time);
    }
    return None;
}

pub fn write_raw_messages_txt(
    app: &AppHandle,
    raw_message: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(formatted_time) = get_formatted_start_time(app) {
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

// pub fn write_parsed_messages_csv(
//     app: &AppHandle,
//     message: TelemetryMessage,
// ) -> Result<(), Box<dyn std::error::Error>> {
//     if let Some(formatted_time) = get_formatted_start_time(app) {
//         let file_name = format!("{formatted_time}_log.csv");
//         let file = OpenOptions::new()
//             .write(true)
//             .create(true)
//             .append(true)
//             .open(file_name);
//         if let Ok(f) = file {
//             let mut writer = csv::WriterBuilder::new().has_headers(false).from_writer(f);
//             writer.serialize(message)?;
//             writer.flush()?;
//         }
//     }

//     Ok(())
// }
