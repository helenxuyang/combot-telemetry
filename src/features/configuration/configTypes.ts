import {
  CONSUMPTION,
  CURRENT,
  EscId,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
} from "../../robot";

export type RobotConfig = {
  name: string;
  escConfigs: Partial<Record<EscId, EscConfig>>;
  uiConfig?: UIConfig;
};

export type EscConfig = {
  name: string;
  measurementConfigs: {
    [TEMPERATURE]: MeasurementConfig;
    [VOLTAGE]: MeasurementConfig;
    [CURRENT]: MeasurementConfig;
    [CONSUMPTION]: MeasurementConfig;
    [RPM]: MeasurementConfig;
    [INPUT]: MeasurementConfig;
  };
  motorConfig: MotorConfig;
};

export type MeasurementConfig = {
  min: number;
  max: number;
  colorIndicators: ColorIndicator[];
  shouldShow: boolean;
};

export type MotorConfig = {
  gearRatio: number;
  motorPolePairs: number;
};

export type ColorIndicator = {
  threshold: number;
  condition: "above" | "below";
  color: string;
  playSound: boolean;
};

export type UIConfig = {
  focusedEsc: EscId | null;
};
