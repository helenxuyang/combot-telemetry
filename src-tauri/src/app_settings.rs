use std::fs;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub config_name: Option<String>,
    pub is_mock_data: bool,
}

pub fn get_settings() -> Result<Settings, std::io::Error> {
    let settings_file_contents = fs::read_to_string("settings.json")?;
    let settings: Settings = serde_json::from_str(&settings_file_contents)?;
    return Ok(settings);
}
