import { EscId, MeasurementName, Robot } from "./robot";

export type StartupMessage = {
  messageType: "startupMessage";
  snr: number;
};

export type EscDataMessage = {
  messageType: "dataMessage";
  escId: EscId;
  temperature: number;
  voltage: number;
  current: number;
  consumption: number;
  rpm: number;
  timestamp: number;
  input: number;
  snr: number;
};

export type EscErrorMessage = {
  messageType: "errorMessage";
  escId: EscId;
  errorCode: number;
  timestamp: number;
  snr: number;
};

export type UnknownMessage = {
  messageType: "unknownMessage";
  rawMessage: string;
  reason: string;
};

export type TauriTelemetryMessage =
  | StartupMessage
  | EscDataMessage
  | EscErrorMessage
  | UnknownMessage;

export const getUpdatedRobot = (
  message: TauriTelemetryMessage,
  robot: Robot,
  config: {
    shouldReplace?: boolean;
    shouldCopy?: boolean;
  } = {},
) => {
  const { shouldReplace = true, shouldCopy = true } = config;
  const newRobot = shouldCopy ? structuredClone(robot) : robot;

  const { messageType } = message;

  if (message.messageType === "unknownMessage") {
    newRobot.unknownMessages.push({
      rawMessage: message.rawMessage,
    });
    return newRobot;
  }

  if (message.messageType === "startupMessage") {
    return newRobot;
  }

  const { timestamp, escId } = message;
  const esc = newRobot.escs[escId];

  // for Stack--no drive but can still get drive inputs from noise
  if (!esc) {
    return newRobot;
  }

  if (newRobot.initialTimestamp === null) {
    newRobot.initialTimestamp = Date.now() - timestamp;
  }

  if (messageType === "errorMessage") {
    const { errorCode, snr } = message;

    esc.errors.push({ errorCode, timestamp, signalStrength: snr });
    return newRobot;
  }

  if (messageType === "dataMessage") {
    const { messageType, escId, timestamp, snr, ...escData } = message;
    (Object.entries(escData) as [MeasurementName, number][]).forEach(
      ([measurementKey, measurementValue]) => {
        if (shouldReplace) {
          esc.data[measurementKey] = [measurementValue];
        } else {
          esc.data[measurementKey].push(measurementValue);
        }
      },
    );
    if (shouldReplace) {
      esc.timestamps = [timestamp];
    } else {
      esc.timestamps.push(timestamp);
    }
    if (shouldReplace) {
      newRobot.signalStrengths = [
        {
          value: snr,
          timestamp,
        },
      ];
    } else {
      newRobot.signalStrengths.push({
        value: snr,
        timestamp,
      });
    }
  }

  return newRobot;
};
