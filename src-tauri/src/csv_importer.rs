use std::{
    fs::OpenOptions,
    io::{BufRead, BufReader},
};
use tauri::{AppHandle, Emitter};

use crate::message_parser::{self, TelemetryMessage};

#[tauri::command]
pub async fn parse_raw_file(app: AppHandle, raw_file_name: String) {
    println!("Parsing raw file {}", raw_file_name);
    let file = OpenOptions::new().read(true).open(raw_file_name);
    if let Ok(f) = file {
        let lines = BufReader::new(f).lines();
        let mut messages: Vec<TelemetryMessage> = Vec::new();
        for line in lines.map_while(Result::ok) {
            let parsed_message = message_parser::parse_message(line);
            messages.push(parsed_message);
        }
        if let Err(error) = app.emit("import-session", &messages) {
            println!("IMPORT ERROR: Failed to emit import-session: {}", error);
        };
    }
}
