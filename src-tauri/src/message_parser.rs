use regex::Regex;
use serde::Serialize;
use std::{fmt::Display, num::ParseIntError};
use tauri::AppHandle;
use uuid::Uuid;

use crate::robot_config::{get_esc_config, EscConfig};

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryData {
    uuid: String,
    raw_message: String,
    pub esc_id: u8,
    temperature: u8,
    voltage: f32,
    current: f32,
    consumption: u32,
    rpm: u32,
    timestamp: u32,
    input: i32,
    snr: i8,
}

#[derive(Debug)]
enum TelemetryDataParseError {
    ParseError(ParseIntError),
    IncorrectChecksumError,
}

impl std::error::Error for TelemetryDataParseError {}

impl Display for TelemetryDataParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TelemetryDataParseError::ParseError(parse_int_error) => {
                write!(f, "{}", parse_int_error)
            }
            TelemetryDataParseError::IncorrectChecksumError => write!(f, "Incorrect checksum",),
        }
    }
}

impl From<ParseIntError> for TelemetryDataParseError {
    fn from(err: ParseIntError) -> Self {
        TelemetryDataParseError::ParseError(err)
    }
}

#[derive(Serialize, Debug, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryStartup {
    uuid: String,
    raw_message: String,
    snr: i8,
}

#[derive(Serialize, Debug, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryError {
    uuid: String,
    raw_message: String,
    pub esc_id: u8,
    error_code: u8,
    timestamp: u32,
    snr: i8,
}

#[derive(Serialize, Debug, PartialEq, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryUnknown {
    uuid: String,
    raw_message: String,
    reason: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "messageType")]
pub enum TelemetryMessage {
    DataMessage(TelemetryData),
    ErrorMessage(TelemetryError),
    UnknownMessage(TelemetryUnknown),
    StartupMessage(TelemetryStartup),
}

// <FF FE FD FC FB FA F9 F8 F7 F6 F5 F4 F3 F2 F1 F0 EF [snr]>
pub fn is_startup_message(message_components: &Vec<&str>) -> bool {
    let countdown = [
        "FF", "FE", "FD", "FC", "FB", "FA", "F9", "F8", "F7", "F6", "F5", "F4", "F3", "F2", "F1",
        "F0", "EF",
    ];

    let is_startup = message_components
        .iter()
        .zip(countdown)
        .all(|(actual, expected)| actual.eq_ignore_ascii_case(expected));
    return is_startup;
}

fn parse_esc_id(info_byte: u8) -> u8 {
    return info_byte & 0b11;
}

fn parse_hex(hex_str: &str) -> Result<u8, ParseIntError> {
    return u8::from_str_radix(hex_str, 16);
}

fn parse_input(raw_high: &str, raw_low: &str) -> Result<i32, ParseIntError> {
    let input_hex = parse_two_bytes(raw_high, raw_low, 1.0)?;
    // transform [1000, 2000] to [-100, 100]
    let input_transformed = (input_hex - 1500.0) * (0.2 as f32);
    return Ok(input_transformed.round() as i32);
}

fn parse_timestamp(raw_values: &[&str]) -> Result<u32, ParseIntError> {
    let timestamp_bytes: Vec<u8> = raw_values
        .iter()
        .map(|&hex| parse_hex(hex))
        .collect::<Result<Vec<_>, _>>()?;
    let timestamp_hex = merge_four_bytes(timestamp_bytes);
    return Ok(timestamp_hex);
}

fn parse_snr(hex_str: &str) -> Result<i8, ParseIntError> {
    let unsigned_val = u8::from_str_radix(hex_str, 16)?;
    return Ok(unsigned_val as i8);
}

fn merge_four_bytes(bytes: Vec<u8>) -> u32 {
    let mut hex: u32 = 0;
    for b in bytes {
        hex = (hex << 8) | (b as u32);
    }
    return hex;
}

fn merge_two_bytes(high_byte: u8, low_byte: u8) -> u16 {
    let extended_high_byte = high_byte as u16;
    let extended_low_byte = low_byte as u16;
    return (extended_high_byte << 8) + extended_low_byte;
}

fn round_to_two_decimals(num: f32) -> f32 {
    return (num * 100.0).round() / 100.0;
}

fn parse_two_bytes(raw_high: &str, raw_low: &str, scale_factor: f32) -> Result<f32, ParseIntError> {
    let high_byte = parse_hex(raw_high)?;
    let low_byte = parse_hex(raw_low)?;

    let raw = merge_two_bytes(high_byte, low_byte) as f32;
    return Ok(raw * scale_factor);
}

// from KISS telemetry protocol
fn update_checksum(crc: u8, crc_seed: u8) -> u8 {
    let mut crc_u = crc ^ crc_seed;

    for _ in 0..8 {
        crc_u = if (crc_u & 0x80) != 0 {
            0x07 ^ (crc_u << 1)
        } else {
            crc_u << 1
        };
    }
    return crc_u;
}

// from KISS telemetry protocol
fn calculate_checksum(buf: &[u8]) -> u8 {
    let mut crc = 0u8;

    for &byte in buf {
        crc = update_checksum(byte, crc);
    }
    return crc;
}

fn validate_checksum(data: &[&str], received_checksum: u8) -> Result<bool, ParseIntError> {
    let parsed_data: Result<Vec<u8>, std::num::ParseIntError> =
        data.iter().map(|&raw| parse_hex(raw)).collect();
    match parsed_data {
        Ok(parsed) => {
            return Ok(calculate_checksum(&parsed) == received_checksum);
        }
        Err(err) => return Err(err),
    }
}

fn parse_message_type(info_byte: u8) -> u8 {
    return (info_byte & 0b1100) >> 2;
}

/*
0.  Info
      bits 7-4: 0000 (TBD)
      bits 3-2: message type
      bits 1-0: ESC ID (0-3)
1.  Temperature
2.  Voltage high byte
3.  Voltage low byte
4.  Current high byte
5.  Current low byte
6.  Consumption high byte
7.  Consumption low byte
8.  RPM high byte
9.  RPM low byte
10. Checksum
11. Input high byte
12. Input low byte
13. Timestamp byte 3
14. Timestamp byte 2
15. Timestamp byte 1
16. Timestamp byte 0
17. SNR

Data conversions:
temp: as-is, in C
voltage: / 100, in V
current: / 100, in A
consumption: as-is, in mAh
rpm: * 100, divide by # motor pole pairs
input: [1000, 2000] -> [-100, 100] y = 0.2(x-1500)
timestamp (time since start): as-is, in ms
snr: as-is, in dB

 */
fn parse_data_message(
    raw_message: &str,
    esc_config: Option<EscConfig>,
) -> Result<TelemetryData, TelemetryDataParseError> {
    let message_components = get_message_components(raw_message);
    let info_byte = parse_hex(message_components[0])?;
    // let message_type = info_byte & 0b1100 >> 2;
    let esc_id = parse_esc_id(info_byte);

    let temperature = parse_hex(message_components[1])?;
    let voltage = round_to_two_decimals(parse_two_bytes(
        message_components[2],
        message_components[3],
        0.01,
    )?);
    let current = round_to_two_decimals(parse_two_bytes(
        message_components[4],
        message_components[5],
        0.01,
    )?);
    let consumption =
        parse_two_bytes(message_components[6], message_components[7], 1.0)?.round() as u32;

    let (motor_pole_pairs, gear_ratio) = if let Some(config) = esc_config.as_ref() {
        (
            config.motor_config.motor_pole_pairs as f32,
            config.motor_config.gear_ratio,
        )
    } else {
        println!("MESSAGE PARSE ERROR: No motor config");
        (1.0, 1.0)
    };

    let rpm = parse_two_bytes(
        message_components[8],
        message_components[9],
        100.0 / motor_pole_pairs / gear_ratio,
    )?
    .round() as u32;

    let checksum = parse_hex(message_components[10])?;
    let is_valid_checksum = validate_checksum(&message_components[1..=9], checksum);

    let input = parse_input(message_components[11], message_components[12])?;
    let timestamp = parse_timestamp(&message_components[13..=16])?;
    let snr = parse_snr(message_components[17])?;

    match is_valid_checksum {
        Ok(is_correct_checksum) => {
            if is_correct_checksum {
                return Ok(TelemetryData {
                    uuid: Uuid::new_v4().to_string(),
                    raw_message: raw_message.to_string(),
                    esc_id,
                    temperature,
                    voltage,
                    current,
                    consumption,
                    rpm,
                    input,
                    timestamp,
                    snr,
                });
            } else {
                return Err(TelemetryDataParseError::IncorrectChecksumError);
            }
        }
        Err(error) => {
            return Err(TelemetryDataParseError::ParseError(error));
        }
    }
}

const HEX_REGEX: &str = "[0-9a-fA-F]+";
fn validate_message_format(raw_message: &str) -> bool {
    let data_format = format!("^<{HEX_REGEX}(?: {HEX_REGEX}){{17}}>$");
    let data_regex = Regex::new(&data_format).unwrap();
    return data_regex.is_match(raw_message);
}

// TODO: update later when error format is finalized
/* ESC error:
0.  Info
      bits 7-4: 0000 (TBD)
      bits 3-2: message type
      bits 1-0: ESC ID (0-3)
1.  Error code
      1 - UART error
      2 - Invalid checksum when reading telemetry from ESC
2-12 Empty
13. Timestamp byte 3
14. Timestamp byte 2
15. Timestamp byte 1
16. Timestamp byte 0
17. SNR
 */
fn parse_error_message(raw_message: &str) -> Result<TelemetryError, ParseIntError> {
    let message_components = get_message_components(raw_message);
    let info_byte = parse_hex(message_components[0])?;
    let esc_id = parse_esc_id(info_byte);
    let error_code = parse_hex(message_components[1])?;
    let timestamp = parse_timestamp(&message_components[13..=16])?;
    let snr = parse_snr(message_components[17])?;

    return Ok(TelemetryError {
        uuid: Uuid::new_v4().to_string(),
        raw_message: raw_message.to_string(),
        esc_id,
        error_code,
        timestamp,
        snr,
    });
}

fn get_message_components(raw_message: &str) -> Vec<&str> {
    // remove < and >
    let innards = &raw_message[1..(raw_message.len() - 1)];
    // split into vec
    let message_components: Vec<&str> = innards.split(" ").collect();
    return message_components;
}

pub fn parse_message(raw_message: String, app: &AppHandle) -> TelemetryMessage {
    let is_valid_message = validate_message_format(&raw_message);
    if !is_valid_message {
        return TelemetryMessage::UnknownMessage(TelemetryUnknown {
            uuid: Uuid::new_v4().to_string(),
            raw_message,
            reason: "invalid format".to_string(),
        });
    }

    // remove < and >
    let innards = &raw_message[1..(raw_message.len() - 1)];
    // split into vec
    let message_components: Vec<&str> = innards.split(" ").collect();

    if is_startup_message(&message_components) {
        let parsed_snr = parse_snr(message_components[17]);
        if let Ok(snr) = parsed_snr {
            return TelemetryMessage::StartupMessage(TelemetryStartup {
                uuid: Uuid::new_v4().to_string(),
                raw_message,
                snr,
            });
        } else {
            return TelemetryMessage::UnknownMessage(TelemetryUnknown {
                uuid: Uuid::new_v4().to_string(),
                raw_message,
                reason: "failed to parse ESC ID".to_string(),
            });
        }
    }

    let info_byte = parse_hex(message_components[0]);
    let Ok(parsed_info_byte) = info_byte else {
        return TelemetryMessage::UnknownMessage(TelemetryUnknown {
            uuid: Uuid::new_v4().to_string(),
            raw_message,
            reason: "failed to parse info byte".to_string(),
        });
    };
    let message_type = parse_message_type(parsed_info_byte);

    /*
    message types
    00 - normal message
    01 - only telemetry
    10 - only input
    11 - error
    */
    if message_type == 0b11 {
        let telemetry_error = parse_error_message(&raw_message);
        return match telemetry_error {
            Ok(parsed_error) => TelemetryMessage::ErrorMessage(parsed_error),
            Err(_error) => TelemetryMessage::UnknownMessage(TelemetryUnknown {
                uuid: Uuid::new_v4().to_string(),
                raw_message,
                reason: "failed to parse error message".to_string(),
            }),
        };
    } else {
        // TODO: handle only telem/only input

        let esc_id = parse_esc_id(parsed_info_byte);
        let esc_config = get_esc_config(&app, esc_id);
        let telemetry_data = parse_data_message(&raw_message, esc_config);
        return match telemetry_data {
            Ok(parsed_data) => TelemetryMessage::DataMessage(parsed_data),
            Err(_error) => TelemetryMessage::UnknownMessage(TelemetryUnknown {
                uuid: Uuid::new_v4().to_string(),
                raw_message,
                reason: "failed to parse data message".to_string(),
            }),
        };
    }
}

#[cfg(test)]
mod tests {
    use crate::robot_config::MotorConfig;

    use super::*;

    #[test]
    fn test_parse_hex_zero() {
        let result = parse_hex("0");
        assert_eq!(result, Ok(0));
    }

    #[test]
    fn test_parse_hex_two_digit() {
        let result = parse_hex("1f");
        assert_eq!(result, Ok(31));
    }

    #[test]
    fn test_parse_hex_too_big() {
        let result = parse_hex("100000000");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_hex_not_hex() {
        let result = parse_hex("hijk");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_input_positive() {
        let result = parse_input("7", "08");
        assert_eq!(result, Ok(60));
    }

    #[test]
    fn test_parse_input_negative() {
        let result = parse_input("3", "E8");
        assert_eq!(result, Ok(-100));
    }

    #[test]
    fn test_parse_esc_id() {
        assert_eq!(parse_esc_id(0b00001100), 0);
        assert_eq!(parse_esc_id(0b00000001), 1);
        assert_eq!(parse_esc_id(0b00000110), 2);
        assert_eq!(parse_esc_id(0b00001011), 3);
    }

    #[test]
    fn test_parse_snr_positive() {
        let result = parse_snr("8");
        assert_eq!(result, Ok(8));
    }

    #[test]
    fn test_parse_snr_negative() {
        let result = parse_snr("FF");
        assert_eq!(result, Ok(-1));
    }

    #[test]
    fn test_merge_four_bytes_values() {
        let bytes = vec![0x00_u8, 0x0E_u8, 0xAA_u8, 0xCA_u8];
        let result = merge_four_bytes(bytes);
        assert_eq!(result, 961226);
    }

    #[test]
    fn test_parse_timestamp() {
        let result = parse_timestamp(&["0", "E", "AA", "CA"]);
        assert_eq!(result, Ok(961226));
    }

    #[test]
    fn test_merge_two_bytes() {
        let result = merge_two_bytes(0x01_u8, 0xff_u8);
        assert_eq!(result, 0x01ff_u16);
    }

    #[test]
    fn test_merge_two_bytes_start_with_zeroes() {
        let result = merge_two_bytes(0x01_u8, 0x02_u8);
        assert_eq!(result, 0x0102_u16);
    }

    #[test]
    fn test_merge_two_bytes_end_with_zeroes() {
        let result = merge_two_bytes(0x30_u8, 0x40_u8);
        assert_eq!(result, 0x3040_u16);
    }

    #[test]
    fn round_to_two_decimals_up() {
        let result = round_to_two_decimals(1.236789);
        assert_eq!(result, 1.24);
    }

    #[test]
    fn round_to_two_decimals_down() {
        let result = round_to_two_decimals(1.23123);
        assert_eq!(result, 1.23);
    }

    #[test]
    fn round_to_two_decimals_zero() {
        let result = round_to_two_decimals(20.00123);
        assert_eq!(result, 20.00);
    }

    #[test]
    fn round_to_two_decimals_up_whole() {
        let result = round_to_two_decimals(99.99999);
        assert_eq!(result, 100.00);
    }

    #[test]
    fn parse_two_bytes_valid() {
        let result = parse_two_bytes("01", "ff", 0.01).unwrap();
        // round to ignore floating point errors that we don't care about
        assert_eq!(round_to_two_decimals(result), 5.11);
    }

    #[test]
    fn calculate_checksum_correct() {
        let components = [
            0x1f_u8, 0x3_u8, 0xA0_u8, 0x0_u8, 0x16_u8, 0x0_u8, 0x4_u8, 0x0_u8, 0x0_u8,
        ];
        let calculated_checksum = calculate_checksum(&components);
        assert_eq!(calculated_checksum, 0xE0_u8);
    }

    #[test]
    fn validate_checksum_correct() {
        let components = ["1F", "3", "A0", "0", "16", "0", "4", "0", "0"];
        let result = validate_checksum(&components, 0xE0_u8);
        assert_eq!(result, Ok(true));
    }

    #[test]
    fn validate_checksum_wrong() {
        let components = ["1F", "3", "A0", "0", "16", "0", "4", "0", "0"];
        let result = validate_checksum(&components, 0x0);
        assert_eq!(result, Ok(false));
    }

    #[test]
    fn validate_checksum_parse_error() {
        let components = ["invalid", "3", "A0", "0", "16", "0", "4", "0", "0"];
        let result = validate_checksum(&components, 0xE0_u8);
        assert!(result.is_err());
    }

    #[test]
    fn parse_data_message_with_config() {
        let mock_config = EscConfig {
            motor_config: MotorConfig {
                motor_pole_pairs: 3,
                gear_ratio: 5.0,
            },
            name: "foobar".to_string(),
        };
        let raw = "<1 17 5 7B 0 13 0 0 0 3 94 5 DD 0 0 1D D8 8>".to_string();
        let result = parse_data_message(&raw, Some(mock_config)).unwrap();
        let expected = TelemetryData {
            uuid: result.uuid.clone(),
            raw_message: raw,
            esc_id: 1,
            temperature: 23,
            voltage: 14.03,
            current: 0.19,
            consumption: 0,
            rpm: 20,
            timestamp: 7640,
            input: 0,
            snr: 8,
        };
        assert!(Uuid::parse_str(&result.uuid).is_ok());
        assert_eq!(result, expected);
    }

    #[test]
    fn parse_data_message_without_config() {
        let raw = "<1 17 5 7B 0 13 0 0 0 3 94 5 DD 0 0 1D D8 8>".to_string();
        let result = parse_data_message(&raw, None).unwrap();
        let expected = TelemetryData {
            uuid: result.uuid.clone(),
            raw_message: raw,
            esc_id: 1,
            temperature: 23,
            voltage: 14.03,
            current: 0.19,
            consumption: 0,
            rpm: 300,
            timestamp: 7640,
            input: 0,
            snr: 8,
        };
        assert!(Uuid::parse_str(&result.uuid).is_ok());
        assert_eq!(result, expected);
    }

    #[test]
    fn parse_error_message_for_code_1() {
        let raw = "<D 1 0 0 0 0 0 0 0 0 0 0 0 0 0 1D D8 8>".to_string();
        let result = parse_error_message(&raw).unwrap();

        let expected = TelemetryError {
            uuid: result.uuid.clone(),
            raw_message: raw,
            esc_id: 1,
            error_code: 1,
            timestamp: 7640,
            snr: 8,
        };

        assert!(Uuid::parse_str(&result.uuid).is_ok());
        assert_eq!(result, expected);
    }

    #[test]
    fn parse_error_message_for_code_2() {
        let raw = "<D 2 0 0 0 0 0 0 0 0 0 0 0 0 0 1D D8 8>".to_string();
        let result = parse_error_message(&raw).unwrap();

        let expected = TelemetryError {
            uuid: result.uuid.clone(),
            raw_message: raw,
            esc_id: 1,
            error_code: 2,
            timestamp: 7640,
            snr: 8,
        };

        assert!(Uuid::parse_str(&result.uuid).is_ok());
        assert_eq!(result, expected);
    }

    #[test]
    fn validate_message_format_valid() {
        let message = "<1 20 1 C1 0 6 0 3C 0 0 5E 5 E7 0 E AA CA 7>";
        assert_eq!(validate_message_format(message), true);
    }

    #[test]
    fn validate_message_format_missing_start() {
        let message = "1 20 1 C1 0 6 0 3C 0 0 5E 5 E7 0 E AA CA 7>";
        assert_eq!(validate_message_format(message), false);
    }

    #[test]
    fn validate_message_format_missing_end() {
        let message = "<1 20 1 C1 0 6 0 3C 0 0 5E 5 E7 0 E AA CA 7";
        assert_eq!(validate_message_format(message), false);
    }

    #[test]
    fn validate_message_format_not_enough_hex() {
        let message = "<1 20 1 C1 0 6 0 3C 0 0 5E 5 E7 0 E AA CA>";
        assert_eq!(validate_message_format(message), false);
        let message = "<1>";
        assert_eq!(validate_message_format(message), false);
    }

    #[test]
    fn validate_message_format_extra_space() {
        let message = "<1  20 1 C1 0 6 0 3C 0 0 5E 5 E7 0 E AA CA 7>";
        assert_eq!(validate_message_format(message), false);
    }

    #[test]
    fn validate_parse_message_type() {
        let info_byte_11 = 0b00001100;
        assert_eq!(parse_message_type(info_byte_11), 0b11);
        let info_byte_10 = 0b00001000;
        assert_eq!(parse_message_type(info_byte_10), 0b10);
        let info_byte_01 = 0b00000100;
        assert_eq!(parse_message_type(info_byte_01), 0b01);
        let info_byte_00 = 0b00000000;
        assert_eq!(parse_message_type(info_byte_00), 0b00);
    }

    #[test]
    fn validate_is_startup_message_valid_startup() {
        let is_startup = is_startup_message(&vec![
            "FF", "FE", "FD", "FC", "FB", "FA", "F9", "F8", "F7", "F6", "F5", "F4", "F3", "F2",
            "F1", "F0", "EF", "8",
        ]);
        assert_eq!(is_startup, true);
    }

    #[test]
    fn validate_is_startup_message_not_startup() {
        let is_startup = is_startup_message(&vec![
            "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF",
            "FF", "FF", "FF", "8",
        ]);
        assert_eq!(is_startup, false);
    }
}
