use serde::Deserialize;
use std::{collections::HashMap, fs, path::Path};
use tauri::{AppHandle, Manager};

use crate::{app_settings::get_settings, telemetry_session::AppState};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RobotConfig {
    pub name: String,
    pub esc_configs: HashMap<u8, EscConfig>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EscConfig {
    pub name: String,
    pub motor_config: MotorConfig,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MotorConfig {
    pub gear_ratio: f32,
    pub motor_pole_pairs: u32,
}

// #[derive(Debug, Clone, Deserialize)]
// pub struct MeasurementConfigs {
//     pub temperature: MeasurementConfig,
//     pub voltage: MeasurementConfig,
//     pub current: MeasurementConfig,
//     pub consumption: MeasurementConfig,
//     pub rpm: MeasurementConfig,
// }

// #[derive(Debug, Clone, Deserialize)]
// pub struct MeasurementConfig {
//     pub min: f32,
//     pub max: f32,
//     pub color_indicators: Vec<ColorIndicator>,
//     pub should_show: bool,
// }

fn save_config(app: AppHandle, file_path: &Path) -> Result<(), tauri::Error> {
    let config_file_contents = fs::read_to_string(file_path)?;
    if let Some(robot_config) = serde_json::from_str(&config_file_contents)? {
        // save to app state
        let state = app.state::<AppState>();
        let robot_config_lock = state.robot_config.write();
        if let Ok(mut lock) = robot_config_lock {
            *lock = Some(robot_config);
        }
    }
    return Ok(());
}

#[tauri::command]
pub fn fetch_current_config(app: AppHandle) -> Result<(), tauri::Error> {
    let settings = get_settings(&app)?;
    if let Some(config_name) = settings.config_name {
        let local_dir = app.path().app_local_data_dir()?;
        let config_file_path = local_dir.join(format!("configs/{config_name}.json"));
        return save_config(app, config_file_path.as_path());
    }
    return Ok(());
}

pub fn get_esc_config(app: &AppHandle, esc_id: u8) -> Option<EscConfig> {
    let state = app.state::<AppState>();
    let robot_config_lock = state.robot_config.read();
    if let Ok(lock) = robot_config_lock {
        return lock
            .as_ref()
            .and_then(|config| config.esc_configs.get(&esc_id))
            .cloned();
    }
    return None;
}
