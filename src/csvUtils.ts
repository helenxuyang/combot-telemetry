import { type MatchMarker, type Robot } from "./robot";
import { initRobotFromConfig, type RobotConfig } from "./storageUtils";

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
        errorCode: Number(row[2]),
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
