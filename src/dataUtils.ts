import {
  type ESC,
  type Measurement,
  type MeasurementName,
  type Robot,
} from "./robot";
import { getInitColossalAvian } from "./storageUtils";

export const DEFAULT_COLOR = "skyblue";
export const HIGHLIGHT_COLOR = "green";

export const getColor = (measurement: Measurement) => {
  const { colorThresholds, highlightThreshold } = measurement;
  let barColor = DEFAULT_COLOR;
  const latestValue = getLatestValue(measurement.values);

  const shouldHighlight = highlightThreshold
    ? latestValue >= highlightThreshold
    : false;

  if (shouldHighlight) {
    barColor = HIGHLIGHT_COLOR;
  } else {
    if (!colorThresholds) {
      return barColor;
    }
    const sortedColorThresholds = [...Object.keys(colorThresholds)].sort(
      (color1, color2) => {
        return colorThresholds[color1] > colorThresholds[color2] ? 1 : -1;
      },
    );
    sortedColorThresholds.forEach((color) => {
      const threshold = colorThresholds[color];
      if (latestValue >= threshold) {
        barColor = color;
      }
    });
  }
  return barColor;
};

export const getClampedPercent = (value: number, min: number, max: number) => {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.round(Math.max(Math.min(percent, 100), 0));
};

export const getLatestValue = (values: Measurement["values"]) => {
  return values.at(-1) ?? 0;
};

export const getLatestPercent = (measurement: Measurement) => {
  return getClampedPercent(
    getLatestValue(measurement.values),
    measurement.min,
    measurement.max,
  );
};

export const getLatestValueDisplay = (measurement: Measurement) => {
  const { unit } = measurement;
  if (unit === "%") {
    return `${getLatestPercent(measurement)}%`;
  } else {
    return `${getLatestValue(measurement.values)}${unit && ` ${unit}`}`;
  }
};

export const calculateTotal = (
  measurementName: MeasurementName,
  escs: Robot["escs"],
) => {
  const values = mapEscs(escs, (esc) =>
    getLatestValue(esc.measurements[measurementName].values),
  );
  const total = values.reduce((sum, curr) => sum + curr, 0);
  return Number(total.toFixed(2));
};

export const forEachEsc = (escs: Robot["escs"], fn: (esc: ESC) => void) => {
  Object.values(escs).forEach((esc) => {
    fn(esc);
  });
};

export const forEachMeasurement = (
  escs: Robot["escs"],
  fn: (measurement: Measurement) => void,
) => {
  Object.values(escs).forEach((esc) => {
    Object.values(esc.measurements).forEach((measurement) => {
      fn(measurement);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapEscs = (escs: Robot["escs"], fn: (esc: ESC) => any) => {
  return Object.values(escs).map((esc) => fn(esc));
};

export const mapMeasurements = (
  measurements: ESC["measurements"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (measurements: Measurement) => any,
) => {
  return Object.values(measurements).map((measurements) => fn(measurements));
};

export const clearValues = (robot: Robot) => {
  forEachMeasurement(robot.escs, (measurement) => {
    measurement.values = [];
  });
  forEachEsc(robot.escs, (esc) => {
    esc.timestamps = [];
    esc.inputs.timestamps = [];
    esc.inputs.values = [];
    esc.errors = [];
  });
  robot.matchMarkers = [];
};

const ROBOT_CACHE = "robotCache";

const getCachedRobot = () => {
  const storedRobotStr = localStorage.getItem(ROBOT_CACHE);
  const storedRobot = storedRobotStr
    ? (JSON.parse(storedRobotStr) as Robot)
    : getInitColossalAvian();
  return storedRobot;
};

export const combineRobotData = (oldRobot: Robot, newRobot: Robot) => {
  const combinedRobot = structuredClone(newRobot);

  forEachEsc(combinedRobot.escs, (esc) => {
    const oldRobotEsc = oldRobot.escs[esc.name];

    Object.values(esc.measurements).forEach((measurement) => {
      const storedValues = oldRobotEsc.measurements[measurement.name].values;
      measurement.values = [...storedValues, ...measurement.values];
    });
    esc.timestamps = [...oldRobotEsc.timestamps, ...esc.timestamps];
    esc.inputs.timestamps = [
      ...oldRobotEsc.inputs.timestamps,
      ...esc.inputs.timestamps,
    ];
    esc.inputs.values = [...oldRobotEsc.inputs.values, ...esc.inputs.values];
    esc.errors = [...oldRobotEsc.errors, ...esc.errors];
  });

  combinedRobot.matchMarkers = [
    ...oldRobot.matchMarkers,
    ...newRobot.matchMarkers,
  ];

  return combinedRobot;
};

export const combineRobotWithCache = (currentRobot: Robot) => {
  return combineRobotData(getCachedRobot(), currentRobot);
};

export const cacheRobotData = (robot: Robot) => {
  const fullRobot = combineRobotWithCache(robot);
  localStorage.setItem(ROBOT_CACHE, JSON.stringify(fullRobot));
  clearValues(robot);
};
