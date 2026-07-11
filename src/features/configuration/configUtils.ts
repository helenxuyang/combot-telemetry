import {
  ALL_MEASUREMENTS,
  ColorIndicator,
  CONSUMPTION,
  CURRENT,
  ESC,
  EscId,
  Robot,
  RPM,
  TEMPERATURE,
  VOLTAGE,
} from "../../robot";

export type RobotConfig = {
  name: string;
  escConfigs: Partial<Record<EscId, EscConfig>>;
};

export type EscConfig = {
  name: string;
  measurementConfigs: {
    [TEMPERATURE]: MeasurementConfig;
    [VOLTAGE]: MeasurementConfig;
    [CURRENT]: MeasurementConfig;
    [CONSUMPTION]: MeasurementConfig;
    [RPM]: MeasurementConfig;
  };
  inputsConfig: MeasurementConfig;
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

export const getNewRobotConfig = (): RobotConfig => {
  return {
    name: "",
    escConfigs: {
      a: getNewEscConfig(),
    },
  };
};

export const getNewEscConfig = (): EscConfig => {
  return {
    name: "",
    measurementConfigs: {
      [TEMPERATURE]: {
        min: 0,
        max: 0,
        colorIndicators: [],
        shouldShow: true,
      },
      [VOLTAGE]: {
        min: 0,
        max: 0,
        colorIndicators: [],
        shouldShow: true,
      },
      [CURRENT]: {
        min: 0,
        max: 0,
        colorIndicators: [],
        shouldShow: true,
      },
      [CONSUMPTION]: {
        min: 0,
        max: 0,
        colorIndicators: [],
        shouldShow: true,
      },
      [RPM]: {
        min: 0,
        max: 0,
        colorIndicators: [],
        shouldShow: true,
      },
    },
    inputsConfig: {
      min: -100,
      max: 100,
      colorIndicators: [],
      shouldShow: true,
    },
    motorConfig: {
      gearRatio: 1,
      motorPolePairs: 7,
    },
  };
};

export const getNewColorIndicator = (): ColorIndicator => {
  return {
    threshold: 0,
    condition: "above",
    color: "#ffffff",
    playSound: false,
  };
};

export const initRobotFromConfig = (robotConfig: RobotConfig): Robot => {
  let escMap: Robot["escs"] = {};

  (Object.entries(robotConfig.escConfigs) as [EscId, EscConfig][]).forEach(
    ([escId, escConfig]) => {
      escMap[escId] = {
        name: escConfig.name,
        data: {
          timestamps: [],
          measurements: ALL_MEASUREMENTS.reduce(
            (acc, measurement) => {
              acc[measurement] = {
                values: [],
              };
              return acc;
            },
            {} as ESC["data"]["measurements"],
          ),
        },
        inputs: {
          timestamps: [],
          values: [],
        },
        errors: [],
      };
    },
  );

  return {
    name: robotConfig.name,
    escs: escMap,
    unknownMessages: [],
    initialTimestamp: null,
    matchMarkers: [],
  };
};
