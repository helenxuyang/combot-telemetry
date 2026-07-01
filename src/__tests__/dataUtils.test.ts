import { describe, expect, it } from "vitest";
import { ColorIndicator } from "../robot";
import {
  DEFAULT_COLOR,
  getColor,
  getLatestValue,
  getClampedPercent,
  getLatestValueDisplay,
  calculateTotal,
} from "../dataUtils";

describe("getColor", () => {
  const indicators: ColorIndicator[] = [
    {
      threshold: 40,
      condition: "below",
      color: "green",
      playSound: false,
    },
    {
      threshold: 60,
      condition: "above",
      color: "orange",
      playSound: false,
    },
    {
      threshold: 80,
      condition: "above",
      color: "red",
      playSound: false,
    },
  ];
  it("gets correct color based on thresholds", () => {
    expect(getColor(0, indicators)).toBe("green");
    expect(getColor(40, indicators)).toBe("green");
    expect(getColor(50, indicators)).toBe(DEFAULT_COLOR);
    expect(getColor(70, indicators)).toBe("orange");
    expect(getColor(80, indicators)).toBe("red");
    expect(getColor(100, indicators)).toBe("red");
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
  it("defaults to 0 if no values", () => {
    expect(getLatestValue([])).toBe(0);
  });

  it("gets last value", () => {
    let values = [10];
    expect(getLatestValue(values)).toBe(10);
    values.push(90);
    expect(getLatestValue(values)).toBe(90);
  });
});

describe("getLatestValueDisplay", () => {
  it("gets display value for measurement with percent unit", () => {
    expect(getLatestValueDisplay(1, "%", 0, 4)).toBe("25%");
  });

  it("gets display value for measurement with non-percent unit", () => {
    expect(getLatestValueDisplay(40, "V", 0, 100)).toBe("40 V");
  });
});

describe("calculateTotal", () => {
  it("calculates total and rounds", () => {
    expect(calculateTotal([10.123, 5.321])).toBe(15.44);
  });
});
