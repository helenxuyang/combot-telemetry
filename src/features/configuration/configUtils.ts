import {
  ALL_MEASUREMENTS,
  CONSUMPTION,
  CURRENT,
  ESC,
  EscId,
  INPUT,
  Robot,
  RPM,
  TEMPERATURE,
  VOLTAGE,
} from "../../robot";
import { ColorIndicator, EscConfig, RobotConfig } from "./configTypes";

export const getNewRobotConfig = (): RobotConfig => {
  return {
    name: "",
    escConfigs: {
      "0": getNewEscConfig(),
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
      [INPUT]: {
        min: -100,
        max: 100,
        colorIndicators: [],
        shouldShow: true,
      },
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
        timestamps: [],
        data: ALL_MEASUREMENTS.reduce(
          (acc, measurement) => {
            acc[measurement] = [];
            return acc;
          },
          {} as ESC["data"],
        ),
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
    signalStrengths: [],
  };
};
