import { describe, expect, test } from "vitest";
import {
  getConfigFromRobot,
  initRobotFromConfig,
  type RobotConfig,
} from "../storageUtils";
import {
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
  type Robot,
} from "../robot";

describe("storageUtils", () => {
  const config: RobotConfig = {
    name: "foobar",
    escConfigs: {
      [DRIVE_LEFT_ESC]: {
        name: DRIVE_LEFT_ESC,
        measurementConfigs: {
          [RPM]: { name: RPM, min: 0, max: 1000, shouldShow: true },
          [TEMPERATURE]: {
            name: TEMPERATURE,
            min: 0,
            max: 100,
            shouldShow: true,
          },
          [CURRENT]: { name: CURRENT, min: 0, max: 100, shouldShow: true },
          [CONSUMPTION]: {
            name: CONSUMPTION,
            min: 0,
            max: 100,
            shouldShow: true,
          },
          [VOLTAGE]: { name: VOLTAGE, min: 0, max: 100, shouldShow: true },
        },
      },
    },
  };

  const robot: Robot = {
    name: "foobar",
    escs: {
      [DRIVE_LEFT_ESC]: {
        name: DRIVE_LEFT_ESC,
        measurements: {
          [RPM]: {
            name: RPM,
            unit: "RPM",
            values: [],
            min: 0,
            max: 1000,
            shouldShow: true,
          },
          [TEMPERATURE]: {
            name: TEMPERATURE,
            unit: "°C",
            values: [],
            min: 0,
            max: 100,
            shouldShow: true,
          },
          [CURRENT]: {
            name: CURRENT,
            unit: "A",
            values: [],
            min: 0,
            max: 100,
            shouldShow: true,
          },
          [CONSUMPTION]: {
            name: CONSUMPTION,
            unit: "mAh",
            values: [],
            min: 0,
            max: 100,
            shouldShow: true,
          },
          [VOLTAGE]: {
            name: VOLTAGE,
            unit: "V",
            values: [],
            min: 0,
            max: 100,
            shouldShow: true,
          },
        },
        abbreviation: "DL",
        timestamps: [],
        errors: [],
        inputs: {
          name: INPUT,
          unit: "",
          min: -100,
          max: 100,
          values: [],
          timestamps: [],
          shouldShow: true,
        },
      },
    },
    initialTimestamp: null,
    matchMarkers: [],
    unknownMessages: [],
  };
  test("initRobotFromConfig", () => {
    expect(initRobotFromConfig(config)).toEqual(robot);
  });

  test("getConfigFromRobot", () => {
    expect(getConfigFromRobot(robot)).toEqual(config);
  });
});
