use std::{
    fs::OpenOptions,
    io::{BufRead, BufReader},
};
use tauri::{AppHandle, Emitter};

use crate::message_parser::{
    self,
    TelemetryMessage::{self, StartupMessage},
};

#[tauri::command]
pub async fn parse_raw_file(app: AppHandle, raw_file_name: String) {
    println!("Parsing raw file {}", raw_file_name);
    let file = OpenOptions::new().read(true).open(raw_file_name);
    let mut sessions: Vec<Vec<TelemetryMessage>> = Vec::new();
    let mut current_session: Vec<TelemetryMessage> = Vec::new();

    if let Ok(f) = file {
        let lines = BufReader::new(f).lines();
        for line in lines.map_while(Result::ok) {
            let parsed_message = message_parser::parse_message(line, &app);
            current_session.push(parsed_message.clone());
            if let StartupMessage(_) = parsed_message {
                // only push if has more than just the startup message
                if current_session.len() > 1 {
                    sessions.push(current_session);
                }
                current_session = Vec::new();
            }
        }
        // push last session
        if current_session.len() > 0 {
            sessions.push(current_session);
        }

        if let Err(error) = app.emit("import-sessions", &sessions) {
            println!("IMPORT ERROR: Failed to emit import-session: {}", error);
        }
    }
}
