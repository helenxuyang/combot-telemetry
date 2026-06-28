import {
  CONSUMPTION,
  CURRENT,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
} from "./robot";

export const METADATA = {
  [TEMPERATURE]: {
    unit: "°C",
    displayName: "Temperature",
  },
  [VOLTAGE]: {
    unit: "V",
    displayName: "Voltage",
  },
  [CURRENT]: {
    unit: "A",
    displayName: "Current",
  },
  [CONSUMPTION]: {
    unit: "mAh",
    displayName: "Consumption",
  },
  [RPM]: {
    unit: "RPM",
    displayName: "RPM",
  },
  [INPUT]: {
    unit: "%",
    displayName: "Input",
  },
} as const;
