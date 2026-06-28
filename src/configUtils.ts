import {
  ALL_MEASUREMENTS,
  CONSUMPTION,
  CURRENT,
  ESC,
  EscId,
  MeasurementConfig,
  Robot,
  RPM,
  RpmMeasurementConfig,
  TEMPERATURE,
  VOLTAGE,
} from "./robot";

export type RobotConfig = {
  name: string;
  escConfigs: Record<EscId, EscConfig>;
};

export type EscConfig = {
  name: string;
  measurementConfigs: {
    [TEMPERATURE]: MeasurementConfig;
    [VOLTAGE]: MeasurementConfig;
    [CURRENT]: MeasurementConfig;
    [CONSUMPTION]: MeasurementConfig;
    [RPM]: RpmMeasurementConfig;
  };
  inputConfig: MeasurementConfig;
};

export const initRobotFromConfig = (robotConfig: RobotConfig): Robot => {
  let escMap: Robot["escs"] = {};

  Object.entries(robotConfig.escConfigs).forEach(([escId, escConfig]) => {
    escMap[escId as EscId] = {
      name: escConfig.name,
      data: {
        timestamps: [],
        measurements: ALL_MEASUREMENTS.reduce(
          (acc, measurement) => {
            acc[measurement] = {
              config: escConfig.measurementConfigs[measurement],
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
        config: {
          min: -100,
          max: 100,
          thresholds: [],
          shouldShow: escConfig.inputConfig.shouldShow,
        },
      },
      errors: [],
    };
  });

  return {
    name: robotConfig.name,
    escs: escMap,
    unknownMessages: [],
    initialTimestamp: null,
    matchMarkers: [],
  };
};
