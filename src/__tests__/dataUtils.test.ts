import { beforeEach, describe, expect, it } from "vitest";
import {
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  VOLTAGE,
  type Measurement,
  type Robot,
} from "../robot";
import {
  DEFAULT_COLOR,
  getColor,
  getLatestValue,
  getClampedPercent,
  HIGHLIGHT_COLOR,
  getLatestPercent,
  getLatestValueDisplay,
  calculateTotal,
  clearValues,
  combineRobotData,
} from "../dataUtils";
import { getMockRobotWithData } from "./testData";
import { getInitColossalAvian } from "../storageUtils";

const mockMeasurement: Measurement = {
  name: VOLTAGE,
  unit: "",
  min: 20,
  max: 100,
  colorThresholds: {
    yellow: 40,
    red: 60,
  },
  highlightThreshold: 80,
  values: [],
  shouldShow: true,
};

const mockRobot: Robot = getInitColossalAvian();

describe("getColor", () => {
  const measurement: Measurement = { ...structuredClone(mockMeasurement) };
  it("gets correct color based on thresholds", () => {
    expect(getColor(measurement)).toBe(DEFAULT_COLOR);
    measurement.values.push(70);
    expect(getColor(measurement)).toBe("red");
    measurement.values.push(80);
    expect(getColor(measurement)).toBe(HIGHLIGHT_COLOR);
    measurement.values.push(40);
    expect(getColor(measurement)).toBe("yellow");
    measurement.values.push(20);
    expect(getColor(measurement)).toBe(DEFAULT_COLOR);
  });
});

describe("getClampedPercent", () => {
  it("calculates percent if value is 0", () => {
    expect(getClampedPercent(0, 0, 30)).toBe(0);
  });
  it("calculates percent for non-zero value", () => {
    expect(getClampedPercent(1, 0, 4)).toBe(25);
  });
  it("calculates percent for max value", () => {
    expect(getClampedPercent(150, 0, 150)).toBe(100);
  });
  it("calculates percent with non-zero minimum value", () => {
    expect(getClampedPercent(100, 50, 250)).toBe(25);
    expect(getClampedPercent(50, 50, 100)).toBe(0);
  });
  it("calculates percent with zero max value", () => {
    expect(getClampedPercent(100, 50, 250)).toBe(25);
  });
  it("calculates percent below min as 0", () => {
    expect(getClampedPercent(-10, 0, 100)).toBe(0);
  });
  it("calculates percent above max as 0", () => {
    expect(getClampedPercent(200, 0, 100)).toBe(100);
  });
});

describe("getLatestValue", () => {
  let measurement: Measurement;

  beforeEach(() => {
    measurement = { ...structuredClone(mockMeasurement) };
  });

  it("defaults to 0 if no values", () => {
    expect(getLatestValue(measurement.values)).toBe(0);
  });

  it("gets last value within min and max", () => {
    measurement.values.push(10);
    expect(getLatestValue(measurement.values)).toBe(10);
    measurement.values.push(90);
    expect(getLatestValue(measurement.values)).toBe(90);
  });

  it("gets last value if outside of min and max", () => {
    measurement.values.push(2);
    expect(getLatestValue(measurement.values)).toBe(2);
    measurement.values.push(200);
    expect(getLatestValue(measurement.values)).toBe(200);
  });
});

describe("getLatestPercent", () => {
  let measurement: Measurement;

  beforeEach(() => {
    measurement = { ...structuredClone(mockMeasurement) };
  });

  it("gets percent equivalent of last value", () => {
    measurement.values.push(20);
    measurement.values.push(100);
    expect(getLatestPercent(measurement)).toBe(100);
  });
});

describe("getLatestValueDisplay", () => {
  let measurement: Measurement;

  beforeEach(() => {
    measurement = { ...structuredClone(mockMeasurement) };
  });

  it("gets display value for measurement with percent unit", () => {
    measurement.unit = "%";
    measurement.values.push(40);
    expect(getLatestValueDisplay(measurement)).toBe("25%");
  });

  it("gets display value for measurement with non-percent unit", () => {
    measurement.unit = "V";
    measurement.values.push(40);
    expect(getLatestValueDisplay(measurement)).toBe("40 V");
  });

  it("gets display value for measurement with no unit", () => {
    measurement.values.push(40);
    expect(getLatestValueDisplay(measurement)).toBe("40");
  });
});

describe("calculateTotal", () => {
  it("calculates total and rounds", () => {
    const robot = { ...structuredClone(mockRobot) };
    expect(calculateTotal(VOLTAGE, robot.escs)).toBe(0);
    robot.escs[DRIVE_LEFT_ESC].measurements[VOLTAGE].values.push(30);
    expect(calculateTotal(VOLTAGE, robot.escs)).toBe(30);
    robot.escs[DRIVE_RIGHT_ESC].measurements[VOLTAGE].values.push(40.123);
    expect(calculateTotal(VOLTAGE, robot.escs)).toBe(70.12);
  });
});

describe("clearValues", () => {
  it("clears all accumulated data", () => {
    const robot = getMockRobotWithData();
    clearValues(robot);
    expect(robot).toEqual(getInitColossalAvian());
  });
});

describe("combineRobotData", () => {
  it("combines empty robot and robot with data", () => {
    const oldRobot = getInitColossalAvian();
    const newRobot = getMockRobotWithData();
    const combinedRobot = combineRobotData(oldRobot, newRobot);
    expect(combinedRobot).toEqual(newRobot);
  });
});
