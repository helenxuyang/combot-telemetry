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

const ERROR_MARKER = "!";

export type EscDataMessage = {
  messageType: "data";
  escName: EscName;
  timestamp: number;
  escData: {
    [TEMPERATURE]: number;
    [VOLTAGE]: number;
    [CURRENT]: number;
    [CONSUMPTION]: number;
    [RPM]: number;
  };
};

export type EscInputMessage = {
  messageType: "input";
  escName: EscName;
  timestamp: number;
  escData: {
    [INPUT]: number;
  };
};

export type EscErrorMessage = {
  messageType: "error";
  escName: EscName;
  code: number;
  timestamp: number;
};

export type UnknownMessage = {
  messageType: "unknown";
  message: string;
  reason: string;
};

export type ParsedMessage =
  | EscDataMessage
  | EscInputMessage
  | EscErrorMessage
  | UnknownMessage;

export const PONG_MESSAGE = "pong";
export const getUnknownMessageReason = (message: string): string | null => {
  if (typeof message !== "string") {
    return "message is not string";
  }
  if (message === PONG_MESSAGE) {
    return null;
  }
  const components = message.slice(1, message.length - 1).split(" ");

  if (components.length < 3) {
    return "message does not have enough components";
  }
  if (message[0] !== "<") {
    return "message missing start marker";
  }
  if (message[message.length - 1] !== ">") {
    return "message missing end marker";
  }

  const id = components[0];
  if (
    !escDataIds.includes(id as EscDataId) &&
    !escInputIds.includes(id as EscInputId)
  ) {
    return "message does not have valid ESC ID";
  }

  // errors
  if (components[1] === "!") {
    if (isNaN(convertHexStrToNum(components[2]))) {
      return "message has invalid error code";
    }
    if (isNaN(convertHexStrToNum(components[3]))) {
      return "message has invalid timestamp";
    }
  }

  // ESC data or input
  else {
    for (let i = 1; i < components.length - 1; i++) {
      if (isNaN(convertHexStrToNum(components[i]))) {
        return `message has invalid component ${components[i]}`;
      }
    }
  }

  return null;
};

// checksum function from KISS telem protocol doc
const updateCRC8 = (crc: number, crcSeed: number): number => {
  let crcU = crc ^ crcSeed;
  for (let i = 0; i < 8; i++) {
    crcU = crcU & 0x80 ? 0x07 ^ (crcU << 1) : crcU << 1;

    crcU &= 0xff;
  }
  return crcU;
};

// checksum function from KISS telem protocol doc
const calculateChecksum = (buf: Uint8Array): number => {
  let crc = 0;
  for (let i = 0; i < buf.length; i++) {
    crc = updateCRC8(buf[i], crc);
  }
  return crc;
};

export const validateChecksum = (data: number[], checksum: number): boolean => {
  const bytes = new Uint8Array(data);
  const calculatedChecksum = calculateChecksum(bytes);
  return calculatedChecksum === checksum;
};

export const parseMessage = (message: string): ParsedMessage => {
  /* Data formats:
  
  ESC telemetry data: 
  ESC ID (a, b, c, or d)
  Byte 0: Temperature
  Byte 1: Voltage high byte
  Byte 2: Voltage low byte
  Byte 3: Current high byte
  Byte 4: Current low byte
  Byte 5: Consumption high byte
  Byte 6: Consumption low byte
  Byte 7: Rpm high byte
  Byte 8: Rpm low byte
  Checksum
  Timestamp

  ESC input data: 
  ESC ID (w, x, y, z)
  Value
  Timestamp

  Error:
  ESC ID (a, b, c, d)
  "!"
  Error code
  Timestamp

  Data conversions:
  temp: as-is, in C
  voltage: / 100, in V
  current: / 100, in A
  consumption: as-is, in mAh
  rpm: * 100, divide by 7
  time since start: as-is, in ms
 */

  const unknownErrorReason = getUnknownMessageReason(message);
  if (unknownErrorReason) {
    return {
      messageType: "unknown",
      message,
      reason: unknownErrorReason,
    };
  }
  console.log(message, unknownErrorReason);

  // remove < and >
  const splitData = message.slice(1, message.length - 1).split(" ");

  const escId = splitData[0] as EscId;
  const escName = idToEscMap[escId];

  if (splitData[1] === ERROR_MARKER) {
    const code = convertHexStrToNum(splitData[2]);
    const timestamp = convertHexStrToNum(splitData[3]);
    return {
      messageType: "error",
      escName,
      code,
      timestamp,
    };
  }

  // drop ESC ID from start
  const values = splitData.slice(1).map((entry) => convertHexStrToNum(entry));
  if (escDataIds.includes(escId as EscDataId)) {
    const rpmFactor = 1 / 7;
    const timestamp = Number(values[10]);

    const escDataValues = values.slice(0, 9);
    const checksum = convertHexStrToNum(splitData[10]);

    if (!validateChecksum(escDataValues, checksum)) {
      return {
        messageType: "unknown",
        message,
        reason: "invalid checksum",
      };
    }

    const escData = {
      [TEMPERATURE]: values[0],
      [VOLTAGE]: Number((mergeBytes(values[1], values[2]) / 100).toFixed(2)),
      [CURRENT]: Number((mergeBytes(values[3], values[4]) / 100).toFixed(2)),
      [CONSUMPTION]: mergeBytes(values[5], values[6]),
      [RPM]: Math.round(mergeBytes(values[7], values[8]) * 100 * rpmFactor),
    };

    for (const value in Object.keys(escData)) {
      if (isNaN(Number(value))) {
        return {
          messageType: "unknown",
          message,
          reason: "ESC data NaN when parsed",
        };
      }
    }

    const parsedMessage: ParsedMessage = {
      messageType: "data",
      escName,
      timestamp,
      escData,
    };
    return parsedMessage;
  } else if (escInputIds.includes(escId as EscInputId)) {
    const value = values[0];
    const timestamp = values[1];
    const input = Math.round(0.2 * value - 300); // scale from [1000, 2000] -> [-100, 100]

    if (isNaN(Number(input))) {
      return {
        messageType: "unknown",
        message,
        reason: "input NaN when parsed",
      };
    }

    const parsedMessage: ParsedMessage = {
      messageType: "input",
      escName,
      timestamp,
      escData: {
        [INPUT]: input,
      },
    };
    return parsedMessage;
  }

  console.log(`invalid message ${message}`);
  return {
    messageType: "unknown",
    message,
    reason: "unknown",
  };
};

export const stringifyMessage = (parsedMessage: ParsedMessage) => {
  if (
    parsedMessage.messageType === "data" ||
    parsedMessage.messageType === "input"
  ) {
    const { messageType, escName, timestamp, escData } = parsedMessage;
    return [messageType, escName, timestamp, ...Object.values(escData)].join(
      ",",
    );
  } else {
    return Object.values(parsedMessage).join(",");
  }
};

export const getUpdatedRobot = (parsedMessage: ParsedMessage, robot: Robot) => {
  const newRobot = structuredClone(robot);

  const { messageType } = parsedMessage;

  if (parsedMessage.messageType === "unknown") {
    newRobot.unknownMessages.push({
      message: parsedMessage.message,
      reason: parsedMessage.reason,
    });
    return newRobot;
  }

  const { timestamp, escName } = parsedMessage;

  // for Stack--no drive but can still get drive inputs from noise
  if (!newRobot.escs[escName]) {
    return newRobot;
  }

  if (newRobot.initialTimestamp === null) {
    newRobot.initialTimestamp = Date.now() - timestamp;
  }

  if (messageType === "error") {
    const { code } = parsedMessage;
    console.log("error", timestamp, code);

    newRobot.escs[escName].errors.push({ code, timestamp });
    return newRobot;
  }

  if (messageType === "data") {
    const { escData } = parsedMessage;
    Object.entries(escData).forEach(([measurementKey, measurementValue]) => {
      newRobot.escs[escName].measurements[measurementKey].values = [
        measurementValue,
      ];
    });
    newRobot.escs[escName].timestamps = [timestamp];
  } else if (messageType === "input") {
    const { escData } = parsedMessage;
    newRobot.escs[escName].inputs.timestamps = [timestamp];
    newRobot.escs[escName].inputs.values = [escData[INPUT]];
  }

  return newRobot;
};
