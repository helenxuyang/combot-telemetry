export type Robot = {
  name: string;
  escs: Record<EscName, ESC>;
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
  unknownMessages: UnknownMessage[];
};

export type Measurement = {
  name: string;
  unit: string;
  min: number;
  max: number;
  actualMin?: number;
  actualMax?: number;
  values: number[];
  colorThresholds?: Record<string, number>;
  highlightThreshold?: number;
  shouldShow: boolean;
};

export type Input = Omit<Measurement, "name"> & {
  name: typeof INPUT;
  timestamps: number[];
  shouldShow: boolean;
};

export const TEMPERATURE = "temperature";
export const RPM = "rpm";
export const VOLTAGE = "voltage";
export const CURRENT = "current";
export const CONSUMPTION = "consumption";
export const INPUT = "input" as const;
export const POWER = "power" as const;
export const ERROR = "error" as const;

export const UNITS: Record<MeasurementName, string> = {
  [TEMPERATURE]: "°C",
  [RPM]: "RPM",
  [VOLTAGE]: "V",
  [CURRENT]: "A",
  [CONSUMPTION]: "mAh",
} as const;

export type MeasurementName =
  | typeof TEMPERATURE
  | typeof RPM
  | typeof VOLTAGE
  | typeof CURRENT
  | typeof CONSUMPTION;

export const TOTAL_CURRENT = "Total Current";
export const TOTAL_CONSUMPTION = "Total Consumption";

export const ALL_DERIVED_VALUES = [TOTAL_CURRENT, TOTAL_CONSUMPTION];
export type DerivedValueName = (typeof ALL_DERIVED_VALUES)[number];

type MeasurementMap = Record<string, Measurement>;
type EscError = {
  timestamp: number;
  errorCode: number;
};

export type ESC = {
  name: EscName;
  abbreviation: string;
  timestamps: number[];
  errors: EscError[];
  measurements: MeasurementMap;
  inputs: Input;
};

export const getInitEscMeasurements = ({
  rpmMax = 20000,
  rpmHighlight = undefined,
  voltageMin = 16,
  voltageMax = 26,
  maxCurrent = 30,
  maxConsumption = 3000,
}: {
  rpmMax?: number;
  rpmHighlight?: number;
  voltageMin?: number;
  voltageMax?: number;
  maxCurrent?: number;
  maxConsumption?: number;
}): MeasurementMap => {
  return {
    [TEMPERATURE]: {
      name: TEMPERATURE,
      unit: "°C",
      min: 25,
      max: 100,
      values: [],
      colorThresholds: {
        gold: 68,
        orange: 75,
        red: 85,
      },
      shouldShow: true,
    },
    [VOLTAGE]: {
      name: VOLTAGE,
      unit: "V",
      min: voltageMin,
      max: voltageMax,
      values: [],
      shouldShow: true,
    },

    [CURRENT]: {
      name: CURRENT,
      unit: "A",
      min: 0,
      max: maxCurrent,
      values: [],
      shouldShow: true,
    },
    [CONSUMPTION]: {
      name: CONSUMPTION,
      unit: "mAh",
      min: 0,
      max: maxConsumption,
      values: [],
      shouldShow: false,
    },
    [RPM]: {
      name: RPM,
      unit: "RPM",
      min: 0,
      max: rpmMax,
      values: [],
      highlightThreshold: rpmHighlight,
      shouldShow: true,
    },
  };
};

export const getInitEsc = (
  name: EscName,
  measurements: MeasurementMap,
): ESC => {
  return {
    name,
    abbreviation: name
      .split("")
      .filter((char) => char.toUpperCase() === char)
      .join(""),
    timestamps: [],
    measurements,
    inputs: {
      name: INPUT,
      unit: "",
      min: -100,
      max: 100,
      values: [],
      timestamps: [],
      shouldShow: true,
    },
    errors: [],
  };
};

export type MatchMarker = {
  type: "START" | "PAUSE" | "RESUME" | "END";
  timestamp: number;
};

export type UnknownMessage = {
  rawMessage: string;
};

export const DRIVE_LEFT_ESC = "DriveLeft" as const;
export const DRIVE_RIGHT_ESC = "DriveRight" as const;
export const ARM_ESC = "Arm" as const;
export const WEAPON_ESC = "Weapon" as const;

export type EscName = string;
// TODO: fix types later?
// | typeof DRIVE_LEFT_ESC
// | typeof DRIVE_RIGHT_ESC
// | typeof WEAPON_ESC;
// | typeof ARM_ESC;

export type RobotSnapshot = {
  name: string;
  escs: Record<EscName, ESCSnapshot>;
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
  unknownMessages: UnknownMessage[];
};

export type ESCSnapshot = {
  name: EscName;
  timestamp: number;
  errors: EscError[];
  measurements: Record<MeasurementName, number>;
  input: number;
};
