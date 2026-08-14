import {
  CONSUMPTION,
  CURRENT,
  INPUT,
  MeasurementName,
  RPM,
  TEMPERATURE,
  VOLTAGE,
} from "./robot";

type Metadata = {
  unit: string;
  displayName: string;
  decimals: number;
};

export const METADATA: Record<MeasurementName, Metadata> = {
  [TEMPERATURE]: {
    unit: "°C",
    displayName: "Temp",
    decimals: 0,
  },
  [VOLTAGE]: {
    unit: "V",
    displayName: "Voltage",
    decimals: 2,
  },
  [CURRENT]: {
    unit: "A",
    displayName: "Current",
    decimals: 2,
  },
  [CONSUMPTION]: {
    unit: "mAh",
    displayName: "Consumption",
    decimals: 0,
  },
  [RPM]: {
    unit: "RPM",
    displayName: "RPM",
    decimals: 0,
  },
  [INPUT]: {
    unit: "",
    displayName: "Input",
    decimals: 0,
  },
} as const;
