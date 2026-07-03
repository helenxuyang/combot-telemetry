import { EscId, MeasurementName, Robot } from "./robot";

export type EscDataMessage = {
  messageType: "dataMessage";
  escId: EscId;
  temperature: number;
  voltage: number;
  current: number;
  consumption: number;
  rpm: number;
  timestamp: number;
};

export type EscInputMessage = {
  messageType: "inputMessage";
  escId: EscId;
  input: number;
  timestamp: number;
};

export type EscErrorMessage = {
  messageType: "errorMessage";
  escId: EscId;
  errorCode: number;
  timestamp: number;
};

export type UnknownMessage = {
  messageType: "unknownMessage";
  rawMessage: string;
  reason: string;
};

export type TauriTelemetryMessage =
  | EscDataMessage
  | EscInputMessage
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
    const { errorCode } = message;

    esc.errors.push({ errorCode, timestamp });
    return newRobot;
  }

  if (messageType === "dataMessage") {
    const { messageType, escId, timestamp, ...escData } = message;
    (Object.entries(escData) as [MeasurementName, number][]).forEach(
      ([measurementKey, measurementValue]) => {
        if (shouldReplace) {
          esc.data.measurements[measurementKey].values = [measurementValue];
        } else {
          esc.data.measurements[measurementKey].values.push(measurementValue);
        }
      },
    );
    if (shouldReplace) {
      esc.data.timestamps = [timestamp];
    } else {
      esc.data.timestamps.push(timestamp);
    }
  } else if (messageType === "inputMessage") {
    const { input } = message;
    if (shouldReplace) {
      esc.inputs.timestamps = [timestamp];
      esc.inputs.values = [input];
    } else {
      esc.inputs.timestamps.push(timestamp);
      esc.inputs.values.push(input);
    }
  }

  return newRobot;
};
