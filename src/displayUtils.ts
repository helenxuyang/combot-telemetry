import {
  CONSUMPTION,
  CURRENT,
  INPUT,
  MeasurementOrInput,
  RPM,
  TEMPERATURE,
  VOLTAGE,
} from "./robot";

type Metadata = {
  unit: string;
  displayName: string;
};

export const METADATA: Record<MeasurementOrInput, Metadata> = {
  [TEMPERATURE]: {
    unit: "°C",
    displayName: "Temp",
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
    unit: "",
    displayName: "Input",
  },
} as const;
