export type Robot = {
  name: string;
  escs: Partial<Record<EscId, ESC>>;
  unknownMessages: UnknownMessage[];
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
  signalStrengths: SignalStrength[];
};

export type ESC = {
  name: string;
  timestamps: number[];
  data: Record<MeasurementName, number[]>;
  errors: EscError[];
};

export type SignalStrength = {
  value: number;
  timestamp: number;
};

export const ALL_ESC_IDs = ["0", "1", "2", "3"] as const;
export type EscId = (typeof ALL_ESC_IDs)[number];

export const convertStrToEscId = (str: string): str is EscId => {
  return ALL_ESC_IDs.includes(str as EscId);
};

type EscError = {
  timestamp: number;
  errorCode: number;
};

export const TEMPERATURE = "temperature" as const;
export const RPM = "rpm" as const;
export const VOLTAGE = "voltage" as const;
export const CURRENT = "current" as const;
export const CONSUMPTION = "consumption" as const;

export const INPUT = "input" as const;
export const ERROR = "error" as const;

export type MeasurementName =
  | typeof TEMPERATURE
  | typeof RPM
  | typeof VOLTAGE
  | typeof CURRENT
  | typeof CONSUMPTION
  | typeof INPUT;

export const ALL_MEASUREMENTS = [
  TEMPERATURE,
  RPM,
  VOLTAGE,
  CURRENT,
  CONSUMPTION,
  INPUT,
] as const;

type UnknownMessage = {
  rawMessage: string;
};

export type MatchMarker = {
  type: "START" | "PAUSE" | "RESUME" | "END";
  timestamp: number;
};
