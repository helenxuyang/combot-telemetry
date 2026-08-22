use std::fs;

use serde::Deserialize;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub config_name: Option<String>,
    pub is_mock_data: bool,
}

pub fn get_settings(app: &AppHandle) -> Result<Settings, tauri::Error> {
    let local_dir = app.path().app_local_data_dir()?;
    let settings_file_path = local_dir.join("settings.json");
    let settings_file_contents = fs::read_to_string(settings_file_path)?;
    let settings = serde_json::from_str(&settings_file_contents)?;
    return Ok(settings);
}
