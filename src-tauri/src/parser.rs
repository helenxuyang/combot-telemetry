use std::num::ParseIntError;

use regex::Regex;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryData {
    esc_name: String,
    timestamp: u32,
    temperature: u32,
    voltage: f32,
    current: f32,
    consumption: u32,
    rpm: u32,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryInput {
    esc_name: String,
    timestamp: u32,
    input: i32,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryError {
    esc_name: String,
    timestamp: u32,
    error_code: u32,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryUnknown {
    raw_message: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "messageType")]
pub enum TelemetryMessage {
    DataMessage(TelemetryData),
    InputMessage(TelemetryInput),
    ErrorMessage(TelemetryError),
    UnknownMessage(TelemetryUnknown),
}

const ERROR_MARKER: &str = "!";

// TODO: figure out ESC name type
fn convert_esc_id_to_name(esc_id: &str) -> &str {
    match esc_id {
        "a" | "w" => "DriveLeft",
        "b" | "x" => "DriveRight",
        "c" | "y" => "Weapon",
        "d" | "z" => "Arm",
        _ => "Unknown",
    }
}

fn parse_hex(hex_str: &str) -> Result<u32, ParseIntError> {
    return u32::from_str_radix(hex_str, 16);
}

fn merge_bytes(high_byte: u32, low_byte: u32) -> u32 {
    return (high_byte << 8) + low_byte;
}

fn round_to_two_decimals(num: f32) -> f32 {
    return (num * 100.0).round() / 100.0;
}

fn parse_two_bytes(raw_high: &str, raw_low: &str, scale_factor: f32) -> Result<f32, ParseIntError> {
    let high_byte = parse_hex(raw_high)?;
    let low_byte = parse_hex(raw_low)?;

    let raw = merge_bytes(high_byte, low_byte) as f32;
    return Ok(raw * scale_factor);
}

/* ESC data:
1.  ESC ID (a, b, c, d)
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
11. Timestamp
 */
fn parse_data_message(message_components: Vec<&str>) -> Result<TelemetryData, ParseIntError> {
    let esc_id = message_components[0];
    let esc_name = convert_esc_id_to_name(esc_id).to_string();
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
    let rpm =
        parse_two_bytes(message_components[8], message_components[9], 100.0 / 7.0)?.round() as u32;
    let timestamp = parse_hex(message_components[11])?;

    // TODO: validate checksum

    return Ok(TelemetryData {
        esc_name,
        temperature,
        voltage,
        current,
        consumption,
        rpm,
        timestamp,
    });
}

const HEX_REGEX: &str = "[0-9a-fA-F]+";

fn validate_data_message_format(raw_message: &str) -> bool {
    let data_format = format!("^<[abcd](?: {HEX_REGEX}){{11}}>$");
    let data_regex = Regex::new(&data_format).unwrap();
    return data_regex.is_match(raw_message);
}

/* ESC input:
0. ESC ID (w, x, y, z)
1. Input
2. Timestamp
 */
fn parse_input_message(message_components: Vec<&str>) -> Result<TelemetryInput, ParseIntError> {
    let esc_id = message_components[0];
    let esc_name = convert_esc_id_to_name(esc_id).to_string();
    let raw_input = parse_hex(message_components[1])? as f32;
    let input = (0.2 * raw_input - 300.0) as i32; // scale from [1000, 2000] -> [-100, 100]
    let timestamp = parse_hex(message_components[2])?;

    return Ok(TelemetryInput {
        esc_name,
        input,
        timestamp,
    });
}

fn validate_input_message_format(raw_message: &str) -> bool {
    let input_format = format!("^<[wxyz](?: {HEX_REGEX}){{2}}>$");
    let input_regex = Regex::new(&input_format).unwrap();
    return input_regex.is_match(raw_message);
}

/* ESC error:
0. ESC ID (a, b, c, d)
1. "!"
2. Error code
3. Timestamp
 */
fn parse_error_message(message_components: Vec<&str>) -> Result<TelemetryError, ParseIntError> {
    let esc_id = message_components[0];
    let esc_name = convert_esc_id_to_name(esc_id).to_string();
    let error_code = parse_hex(message_components[2])?;
    let timestamp = parse_hex(message_components[3])?;

    return Ok(TelemetryError {
        esc_name,
        timestamp,
        error_code,
    });
}

fn validate_error_message_format(raw_message: &str) -> bool {
    let error_format = format!("^<[abcd] !(?: {HEX_REGEX}){{2}}>$");
    let error_regex = Regex::new(&error_format).unwrap();
    return error_regex.is_match(raw_message);
}

pub fn parse_message(raw_message: String) -> TelemetryMessage {
    // TODO: handle pong?

    let is_valid_message = validate_data_message_format(&raw_message)
        || validate_input_message_format(&raw_message)
        || validate_error_message_format(&raw_message);
    if !is_valid_message {
        return TelemetryMessage::UnknownMessage(TelemetryUnknown { raw_message });
    }

    // remove < and >
    let innards = &raw_message[1..(raw_message.len() - 1)];

    // split into vec
    let message_components: Vec<&str> = innards.split(" ").collect();

    if message_components[1] == ERROR_MARKER {
        let telemetry_error = parse_error_message(message_components);
        return match telemetry_error {
            Ok(telem_error) => TelemetryMessage::ErrorMessage(telem_error),
            Err(_error) => TelemetryMessage::UnknownMessage(TelemetryUnknown { raw_message }),
        };
    }

    let esc_id = message_components[0];
    match esc_id {
        "a" | "b" | "c" => {
            let telemetry_data = parse_data_message(message_components);
            return match telemetry_data {
                Ok(telem_data) => TelemetryMessage::DataMessage(telem_data),
                Err(_error) => TelemetryMessage::UnknownMessage(TelemetryUnknown { raw_message }),
            };
        }
        "w" | "x" | "y" | "z" => {
            let telemetry_input = parse_input_message(message_components);
            return match telemetry_input {
                Ok(telem_input) => TelemetryMessage::InputMessage(telem_input),
                Err(_error) => TelemetryMessage::UnknownMessage(TelemetryUnknown { raw_message }),
            };
        }
        _ => TelemetryMessage::UnknownMessage(TelemetryUnknown { raw_message }),
    }
}

#[cfg(test)]
mod tests {
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
    fn test_parse_hex_many_digits() {
        let result = parse_hex("4943D");
        assert_eq!(result, Ok(300093));
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
    fn test_merge_bytes() {
        let result = merge_bytes(0x01_u32, 0xff_u32);
        assert_eq!(result, 0x01ff_u32);
    }

    #[test]
    fn test_merge_bytes_start_with_zeroes() {
        let result = merge_bytes(0x01_u32, 0x02_u32);
        assert_eq!(result, 0x0102_u32);
    }

    #[test]
    fn test_merge_bytes_end_with_zeroes() {
        let result = merge_bytes(0x30_u32, 0x40_u32);
        assert_eq!(result, 0x3040_u32);
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
    fn parse_data_message_weapon() {
        let result = parse_data_message(
            [
                "c", "1F", "3", "A0", "0", "16", "0", "4", "0", "0", "E0", "5D24",
            ]
            .to_vec(),
        );
        let expected = TelemetryData {
            esc_name: "Weapon".to_string(),
            temperature: 31,
            voltage: 9.28,
            current: 0.22,
            consumption: 4,
            rpm: 0,
            timestamp: 23844,
        };
        assert_eq!(result, Ok(expected));
    }

    #[test]
    fn parse_input_message_weapon() {
        let result = parse_input_message(["y", "6D6", "4C5"].to_vec());
        let expected = TelemetryInput {
            esc_name: "Weapon".to_string(),
            input: 50,
            timestamp: 1221,
        };
        assert_eq!(result, Ok(expected));
    }

    #[test]
    fn parse_input_message_drive() {
        let result = parse_error_message(["a", "!", "2", "529"].to_vec());
        let expected = TelemetryError {
            esc_name: "DriveLeft".to_string(),
            error_code: 2,
            timestamp: 1321,
        };
        assert_eq!(result, Ok(expected));
    }

    #[test]
    fn validate_data_message_format_valid() {
        let message = "<c 1F 3 A0 0 16 0 4 0 0 E0 5D24>";
        assert_eq!(validate_data_message_format(message), true);
    }

    #[test]
    fn validate_data_message_format_not_data_esc() {
        let message = "<w 1F 3 A0 0 16 0 4 0 0 E0 5D24>";
        assert_eq!(validate_data_message_format(message), false);
    }

    #[test]
    fn validate_data_message_format_missing_start() {
        let message = "c 1F 3 A0 0 16 0 4 0 0 E0 5D24>";
        assert_eq!(validate_data_message_format(message), false);
    }

    #[test]
    fn validate_data_message_format_missing_end() {
        let message = "<c 1F 3 A0 0 16 0 4 0 0 E0 5D24";
        assert_eq!(validate_data_message_format(message), false);
    }

    #[test]
    fn validate_data_message_format_not_enough_hex() {
        let message = "<c 1F A0 0 16 0 4 0 0 E0 5D24";
        assert_eq!(validate_data_message_format(message), false);
        let message = "<c 1F 5D24>";
        assert_eq!(validate_data_message_format(message), false);
    }

    #[test]
    fn validate_data_message_format_extra_space() {
        let message = "<c  1F 3 A0 0 16 0 4 0 0 E0 5D24>";
        assert_eq!(validate_data_message_format(message), false);
    }

    #[test]
    fn validate_input_message_format_valid() {
        let message = "<w 1F 5D24>";
        assert_eq!(validate_input_message_format(message), true);
    }

    #[test]
    fn validate_input_message_format_not_input_esc() {
        let message = "<a 1F 5D24>";
        assert_eq!(validate_input_message_format(message), false);
    }

    #[test]
    fn validate_input_message_format_not_enough_hex() {
        let message = "<a 5D24>";
        assert_eq!(validate_input_message_format(message), false);
    }

    #[test]
    fn validate_error_message_format_valid() {
        let message = "<b ! 1 F42>";
        assert_eq!(validate_error_message_format(message), true);
    }

    #[test]
    fn validate_error_message_format_no_code() {
        let message = "<a ! 5D24>";
        assert_eq!(validate_error_message_format(message), false);
    }
}
