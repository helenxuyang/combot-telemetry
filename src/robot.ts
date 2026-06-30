export type Robot = {
  name: string;
  escs: Partial<Record<EscId, ESC>>;
  unknownMessages: UnknownMessage[];
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
};

export type ESC = {
  name: string;
  data: {
    timestamps: number[];
    measurements: Record<MeasurementName, Measurement>;
  };
  inputs: {
    timestamps: number[];
    values: number[];
  };
  errors: EscError[];
};

export type Measurement = {
  values: number[];
};

export const ALL_ESC_IDs = ["a", "b", "c", "d"] as const;
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

export type MeasurementName =
  | typeof TEMPERATURE
  | typeof RPM
  | typeof VOLTAGE
  | typeof CURRENT
  | typeof CONSUMPTION;

export const ALL_MEASUREMENTS = [
  TEMPERATURE,
  RPM,
  VOLTAGE,
  CURRENT,
  CONSUMPTION,
] as const;

export type MeasurementOrInput = MeasurementName | typeof INPUT;

type UnknownMessage = {
  rawMessage: string;
};

export type ColorIndicator = {
  threshold: number;
  condition: "above" | "below";
  color: string;
  playSound: boolean;
  // TODO: maybe add sound type like positive vs negative
};

export type MatchMarker = {
  type: "START" | "PAUSE" | "RESUME" | "END";
  timestamp: number;
};
