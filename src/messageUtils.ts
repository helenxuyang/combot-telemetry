import {
  ARM_ESC,
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
  WEAPON_ESC,
  type EscName,
  type Robot,
} from "./robot";

export const mergeBytes = (byte1: number, byte2: number) => {
  return (byte1 << 8) + byte2;
};

export const convertHexStrToNum = (hexStr: string): number =>
  Number("0x" + hexStr);

const escDataIds = ["a", "b", "c"] as const;
const escInputIds = ["w", "x", "y", "z"] as const;
type EscDataId = (typeof escDataIds)[number];
type EscInputId = (typeof escInputIds)[number];
type EscId = EscDataId | EscInputId;

export const idToEscMap: Record<EscId, EscName> = {
  a: DRIVE_LEFT_ESC,
  b: DRIVE_RIGHT_ESC,
  c: WEAPON_ESC,
  w: DRIVE_LEFT_ESC,
  x: DRIVE_RIGHT_ESC,
  y: WEAPON_ESC,
  z: ARM_ESC,
};

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
  code: number;
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
    const { code } = message;
    console.log("error", timestamp, code);

    newRobot.escs[escName].errors.push({ code, timestamp });
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
