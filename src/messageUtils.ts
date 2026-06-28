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
};

export type TauriTelemetryMessage =
  | EscDataMessage
  | EscInputMessage
  | EscErrorMessage
  | UnknownMessage;

export const getUpdatedRobot = (
  message: TauriTelemetryMessage,
  robot: Robot,
) => {
  const newRobot = structuredClone(robot);

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
    console.log("error", timestamp, errorCode);

    esc.errors.push({ errorCode, timestamp });
    return newRobot;
  }

  if (messageType === "dataMessage") {
    const { messageType, escId, timestamp, ...escData } = message;
    Object.entries(escData).forEach(([measurementKey, measurementValue]) => {
      esc.data.measurements[measurementKey as MeasurementName].values = [
        measurementValue,
      ];
    });
    esc.data.timestamps = [timestamp];
  } else if (messageType === "inputMessage") {
    const { input } = message;
    esc.inputs.timestamps = [timestamp];
    esc.inputs.values = [input];
  }

  return newRobot;
};
