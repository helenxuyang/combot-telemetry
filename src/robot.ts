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
    config: MeasurementConfig;
  };
  errors: EscError[];
};

export type Measurement = {
  config: MeasurementConfig;
  values: number[];
};

export type MeasurementConfig = {
  min: number;
  max: number;
  thresholds: Threshold[];
  shouldShow: boolean;
  // TODO: display: null | "verticalBar" | "horizontalBar" | "outerArc" | "innerArc";
};

export type RpmMeasurementConfig = MeasurementConfig & {
  gearRatio: number;
  motorPolePairs: number;
};

export type EscId = "a" | "b" | "c" | "d";

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

type UnknownMessage = {
  rawMessage: string;
};

export type Threshold = {
  value: number;
  condition: "above" | "below";
  color: string;
  playSound: boolean;
  // TODO: maybe add sound type like positive vs negative
};

export type MatchMarker = {
  type: "START" | "PAUSE" | "RESUME" | "END";
  timestamp: number;
};
