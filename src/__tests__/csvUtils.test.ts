import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
  WEAPON_ESC,
  type Robot,
} from "../robot";
import { getCsvData, importRobot } from "../csvUtils";
import { getMockRobotWithData } from "./testData";
import { getDefaultColossalAvianConfig } from "../storageUtils";

describe("csvUtils", () => {
  let robot: Robot;

  beforeEach(() => {
    robot = getMockRobotWithData();
  });

  const expectedCsvData = [
    [
      "type",
      "esc",
      "timestamp",
      TEMPERATURE,
      VOLTAGE,
      CURRENT,
      CONSUMPTION,
      RPM,
    ],
    ["data", DRIVE_LEFT_ESC, 1, 25, 30, 100, 500, 1000],
    ["data", DRIVE_LEFT_ESC, 5, 50, 20, 100, 600, 2000],
    ["data", DRIVE_LEFT_ESC, 10, 75, 10, 100, 700, 3000],
    ["type", "esc", "timestamp", INPUT],
    ["input", DRIVE_LEFT_ESC, 3, 0],
    ["input", DRIVE_LEFT_ESC, 6, 100],
    [
      "type",
      "esc",
      "timestamp",
      TEMPERATURE,
      VOLTAGE,
      CURRENT,
      CONSUMPTION,
      RPM,
    ],
    ["data", DRIVE_RIGHT_ESC, 2, 50, 20, 80, 700, 5000],
    ["data", DRIVE_RIGHT_ESC, 4, 50, 30, 90, 800, 6000],
    ["type", "esc", "timestamp", INPUT],
    ["input", DRIVE_RIGHT_ESC, 5, -100],
    ["input", DRIVE_RIGHT_ESC, 8, -100],
    ["type", "esc", "timestamp"],
    ["error", WEAPON_ESC, 11],
    ["error", WEAPON_ESC, 12],
    ["type", "event", "timestamp"],
    ["matchMarker", "START", 0],
    ["matchMarker", "PAUSE", 15],
    ["matchMarker", "RESUME", 20],
    ["matchMarker", "END", 25],
  ];

  describe("getCsvData", () => {
    it("exports data, inputs, errors, and match markers", () => {
      const csvData = getCsvData(robot);
      expect(csvData).toEqual(expectedCsvData);
    });
  });

  describe("importRobot", () => {
    it("imports robot", () => {
      const mockCsvData = expectedCsvData.map((row) =>
        row.map((entry) => String(entry)),
      );
      const importedRobot = importRobot(
        getDefaultColossalAvianConfig(),
        mockCsvData,
      );
      expect(importedRobot).toEqual(robot);
    });
  });
});
