use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs};
use tauri::{AppHandle, Manager};

use crate::{app_settings::get_settings, telemetry_session::AppState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RobotConfig {
    pub name: String,
    pub esc_configs: HashMap<String, EscConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscConfig {
    pub name: String,
    pub motor_config: MotorConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MotorConfig {
    pub gear_ratio: f32,
    pub motor_pole_pairs: u32,
}

// #[derive(Debug, Clone, Serialize, Deserialize)]
// pub struct MeasurementConfigs {
//     pub temperature: MeasurementConfig,
//     pub voltage: MeasurementConfig,
//     pub current: MeasurementConfig,
//     pub consumption: MeasurementConfig,
//     pub rpm: MeasurementConfig,
// }

// #[derive(Debug, Clone, Serialize, Deserialize)]
// pub struct MeasurementConfig {
//     pub min: f32,
//     pub max: f32,
//     pub color_indicators: Vec<ColorIndicator>,
//     pub should_show: bool,
// }

#[tauri::command]
pub fn fetch_current_config(app: AppHandle) {
    let robot_config = get_settings()
        .ok()
        .and_then(|settings| settings.config_name)
        .and_then(|config_name| fs::read_to_string(config_name).ok())
        .and_then(|config_file_contents| serde_json::from_str(&config_file_contents).ok());

    if let Some(config) = robot_config {
        // save to app state
        let state = app.state::<AppState>();
        let robot_config_lock = state.robot_config.write();
        if let Ok(mut lock) = robot_config_lock {
            *lock = Some(config);
        }
    }
}

pub fn get_esc_config(app: &AppHandle, esc_id: &str) -> Option<EscConfig> {
    let state = app.state::<AppState>();
    let robot_config_lock = state.robot_config.read();
    if let Ok(lock) = robot_config_lock {
        return lock
            .as_ref()
            .and_then(|config| config.esc_configs.get(esc_id))
            .cloned();
    }
    return None;
}
