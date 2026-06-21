import { EscName, Robot } from "./robot";

export type EscDataMessage = {
  messageType: "dataMessage";
  escName: EscName;
  temperature: number;
  voltage: number;
  current: number;
  consumption: number;
  rpm: number;
  timestamp: number;
};

export type EscInputMessage = {
  messageType: "inputMessage";
  escName: EscName;
  input: number;
  timestamp: number;
};

export type EscErrorMessage = {
  messageType: "errorMessage";
  escName: EscName;
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

  const { timestamp, escName } = message;

  // for Stack--no drive but can still get drive inputs from noise
  if (!newRobot.escs[escName]) {
    return newRobot;
  }

  if (newRobot.initialTimestamp === null) {
    newRobot.initialTimestamp = Date.now() - timestamp;
  }

  if (messageType === "errorMessage") {
    const { errorCode } = message;
    console.log("error", timestamp, errorCode);

    newRobot.escs[escName].errors.push({ errorCode, timestamp });
    return newRobot;
  }

  if (messageType === "dataMessage") {
    const { messageType, escName, timestamp, ...escData } = message;
    Object.entries(escData).forEach(([measurementKey, measurementValue]) => {
      newRobot.escs[escName].measurements[measurementKey].values = [
        measurementValue,
      ];
    });
    newRobot.escs[escName].timestamps = [timestamp];
  } else if (messageType === "inputMessage") {
    const { input } = message;
    newRobot.escs[escName].inputs.timestamps = [timestamp];
    newRobot.escs[escName].inputs.values = [input];
  }

  return newRobot;
};
