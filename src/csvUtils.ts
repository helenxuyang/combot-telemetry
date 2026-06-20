import { forEachEsc } from "./dataUtils";
import { type MatchMarker, type Robot, INPUT } from "./robot";
import { initRobotFromConfig, type RobotConfig } from "./storageUtils";

export type CSVRow = (string | number)[];

export const getCsvData = (robot: Robot): CSVRow[] => {
  const rows: CSVRow[] = [];

  forEachEsc(robot.escs, (esc) => {
    const measurements = Object.values(esc.measurements);
    const measurementNames = measurements.map(
      (measurement) => measurement.name,
    );

    const dataRows = esc.timestamps.map((timestamp, index) => {
      return [
        "data",
        esc.name,
        timestamp,
        ...measurements.map((measurement) => measurement.values[index]),
      ];
    });

    if (dataRows.length > 0) {
      const dataHeaderRow = ["type", "esc", "timestamp", ...measurementNames];
      rows.push(dataHeaderRow);
      dataRows.forEach((row) => rows.push(row));
    }

    const inputRows =
      esc.inputs.timestamps?.map((timestamp, index) => {
        return ["input", esc.name, timestamp, esc.inputs.values[index]];
      }) ?? [];

    if (inputRows.length > 0) {
      const inputHeaderRow = ["type", "esc", "timestamp", INPUT];
      rows.push(inputHeaderRow);
      inputRows.forEach((row) => rows.push(row));
    }

    const errorRows = esc.errors.map((error) => [
      "error",
      esc.name,
      error.timestamp,
    ]);
    if (errorRows.length > 0) {
      const errorHeaderRow = ["type", "esc", "timestamp"];
      rows.push(errorHeaderRow);
      errorRows.forEach((row) => rows.push(row));
    }
  });

  const matchMarkerRows = robot.matchMarkers.map(({ type, timestamp }) => {
    return ["matchMarker", type, timestamp];
  });
  if (matchMarkerRows.length > 0) {
    const matchMarkerHeaderRow = ["type", "event", "timestamp"];
    rows.push(matchMarkerHeaderRow);
    matchMarkerRows.forEach((row) => rows.push(row));
  }

  const unknownMessages = robot.unknownMessages.map(({ rawMessage }) => {
    return [rawMessage];
  });
  if (unknownMessages.length > 0) {
    const unknownMessageHeaderRow = ["unknownMessage", "reason"];
    rows.push(unknownMessageHeaderRow);
    unknownMessages.forEach((row) => rows.push(row));
  }

  return rows;
};

export const importRobot = (
  config: RobotConfig,
  csvData: string[][],
): Robot => {
  const robot = initRobotFromConfig(config);

  const normalizeTimestamps = (rows: string[][]) => {
    const timestampRows = rows.filter(
      (row) =>
        ["data", "input", "error", "matchMarker"].includes(row[0]) &&
        row.length > 2 &&
        !Number.isNaN(Number(row[2])),
    );
    if (timestampRows.length === 0) {
      return;
    }

    let minTimestamp = Infinity;
    for (let i = 0; i < timestampRows.length; i++) {
      const row = timestampRows[i];
      const timestamp = Number(row[2]);
      if (timestamp < minTimestamp) {
        minTimestamp = timestamp;
      }
    }

    if (minTimestamp === 0 || !Number.isFinite(minTimestamp)) {
      return;
    }
    // timestampRows.forEach((row) => {
    //   row[2] = String(Number(row[2]) - minTimestamp);
    // });

    for (let i = 0; i < timestampRows.length; i++) {
      const row = timestampRows[i];
      row[2] = String(Number(row[2]) - minTimestamp);
    }
  };

  normalizeTimestamps(csvData);

  let currentSection:
    | "data"
    | "input"
    | "error"
    | "matchMarker"
    | "unknownMessage"
    | null = null;
  let dataMeasurementNames: string[] = [];

  csvData.forEach((row) => {
    if (row.length === 0) {
      return;
    }

    if (
      row[0] === "type" &&
      (row[1] === "esc" || row[1] === "escName") &&
      row[2] === "timestamp"
    ) {
      if (row.length === 4 && row[3] === "input") {
        currentSection = "input";
      } else if (row.length === 3) {
        currentSection = "error";
      } else {
        currentSection = "data";
        dataMeasurementNames = row.slice(3);
      }
      return;
    }

    if (row[0] === "type" && row[1] === "event" && row[2] === "timestamp") {
      currentSection = "matchMarker";
      return;
    }

    if (row[0] === "unknownMessage" && row[1] === "reason") {
      currentSection = "unknownMessage";
      return;
    }

    if (!currentSection) {
      return;
    }

    if (currentSection === "data" && row[0] === "data" && robot.escs[row[1]]) {
      const esc = robot.escs[row[1]];
      esc.timestamps.push(Number(row[2]));
      row.slice(3).forEach((value, index) => {
        const measurement = esc.measurements[dataMeasurementNames[index]];
        if (measurement) {
          measurement.values.push(Number(value));
        }
      });
      return;
    }

    if (
      currentSection === "input" &&
      row[0] === "input" &&
      robot.escs[row[1]]
    ) {
      const esc = robot.escs[row[1]];
      esc.inputs.timestamps.push(Number(row[2]));
      esc.inputs.values.push(Number(row[3]));
      return;
    }

    if (
      currentSection === "error" &&
      row[0] === "error" &&
      robot.escs[row[1]]
    ) {
      robot.escs[row[1]].errors.push({
        code: Number(row[2]),
        timestamp: Number(row[3]),
      });
      return;
    }

    if (currentSection === "matchMarker" && row[0] === "matchMarker") {
      robot.matchMarkers.push({
        type: row[1] as MatchMarker["type"],
        timestamp: Number(row[2]),
      });
      return;
    }

    if (currentSection === "unknownMessage") {
      robot.unknownMessages.push({
        rawMessage: row[0],
      });
      return;
    }
  });

  console.log("Imported robot", robot);
  return robot;
};
