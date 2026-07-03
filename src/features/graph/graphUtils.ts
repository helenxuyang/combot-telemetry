import { METADATA } from "../../displayUtils";
import {
  type Robot,
  type MeasurementName,
  INPUT,
  ERROR,
  EscId,
  MeasurementOrInput,
  ESC,
  Measurement,
} from "../../robot";
import { MeasurementConfig, RobotConfig } from "../configuration/configUtils";

type DataPlot = {
  escId: EscId;
  type: "data";
  measurementName: MeasurementName;
};

type InputPlot = {
  escId: EscId;
  type: typeof INPUT;
};

type ErrorPlot = {
  escId: EscId;
  type: typeof ERROR;
};

export type Plot = DataPlot | InputPlot | ErrorPlot;

export const stringifyPlot = (plot: Plot) => {
  if (plot.type === "data") {
    return `${plot.escId}-${plot.measurementName}`;
  } else {
    return `${plot.escId}-${plot.type}`;
  }
};

export const parsePlot = (id: string): Plot => {
  const idComponents = id.split("-");
  const escId = idComponents[0] as EscId;
  const part = idComponents[1];
  if (part === INPUT || part === ERROR) {
    return {
      escId,
      type: part,
    };
  } else {
    return {
      escId: escId,
      type: "data",
      measurementName: part as MeasurementName,
    };
  }
};

export const getSeriesColor = (measurementName: MeasurementOrInput) => {
  switch (measurementName) {
    case "temperature":
      return "darkred";
    case "rpm":
      return "darkorange";
    case "voltage":
      return "goldenrod";
    case "current":
      return "darkgreen";
    case "consumption":
      return "blue";
    case "input":
      return "gray";
    default:
      return "black";
  }
};

export const getSeriesData = (timestamps: number[], values: number[]) => {
  return timestamps.map((time, index) => [time, values[index]]);
};

export const getSeriesConfig = (
  escId: EscId,
  escName: string,
  plotName: MeasurementOrInput,
) => {
  return {
    id: `${escId}-${plotName}`,
    name: `${escName} ${plotName}`,
    type: "line",
    showSymbol: true,
    symbolSize: 2,
    itemStyle: {
      color: getSeriesColor(plotName),
    },
    sampling: "lttb",
  };
};

export const getDataSeries = (robot: Robot, plot: DataPlot) => {
  const { escId, measurementName } = plot;
  const esc = robot.escs[escId];
  if (!esc) {
    return {};
  }
  const timestamps = esc.data.timestamps;
  const values = esc.data.measurements[measurementName].values;
  const seriesData = getSeriesData(timestamps, values);

  return {
    data: seriesData,
    ...getSeriesConfig(escId, esc.name, measurementName),
  };
};

export const getInputSeries = (robot: Robot, plot: InputPlot) => {
  const { escId, type } = plot;
  const esc = robot.escs[escId];
  if (!esc) {
    return {};
  }
  const timestamps = esc.inputs.timestamps;
  const values = esc.inputs.values;
  const seriesData = getSeriesData(timestamps, values);

  return {
    data: seriesData,
    ...getSeriesConfig(escId, esc.name, type),
  };
};

export const getErrorSeries = (robot: Robot, plot: ErrorPlot) => {
  const { escId } = plot;
  const esc = robot.escs[escId];
  if (!esc) {
    return {};
  }

  return {
    type: "line",
    name: `${esc.name} ${ERROR}`,
    data: esc.errors.map((error) => error.timestamp),
    markLine: {
      silent: true,
      symbolSize: 5,
      data: esc.errors.map((error) => {
        return {
          xAxis: error.timestamp,
          label: {
            formatter: `ERR ${String(error.errorCode)}`,
          },
        };
      }),
    },
  };
};

export const getXAxis = () => {
  const axis = {
    name: "seconds",
    type: "value", // TODO: maybe this should be time?
    nameLocation: "middle",
    axisLabel: {
      formatter: (value: string) => {
        const sec = Number(value) / 1000;
        return sec.toFixed(sec % 1 === 0 ? 0 : 2);
      },
    },
    alignTicks: true,
    max: "dataMax",
  };
  return axis;
};

const yAxisSettings = {
  axisLine: { onZero: false },
  axisLabel: { fontSize: 10 },
  nameTextStyle: {
    fontSize: 10,
  },
  alignTicks: true,
};

export const getYAxisConfig = (
  name: MeasurementOrInput,
  config: MeasurementConfig,
) => {
  const unit = METADATA[name].unit;
  return {
    name: `${unit.length > 0 ? unit : name}`,
    ...yAxisSettings,
    min: config.min,
    max: config.max,
  };
};

export const getDataYAxis = (
  robot: Robot,
  robotConfig: RobotConfig,
  plot: DataPlot,
) => {
  const { escId, measurementName } = plot;
  const esc = robot.escs[escId];
  const measurementConfig =
    robotConfig.escConfigs[escId]?.measurementConfigs[measurementName];

  if (!esc || !measurementConfig) {
    return {};
  }
  return getYAxisConfig(measurementName, measurementConfig);
};

export const getInputYAxis = (
  robot: Robot,
  robotConfig: RobotConfig,
  plot: InputPlot,
) => {
  const { escId, type } = plot;
  const esc = robot.escs[escId];
  const measurementConfig = robotConfig.escConfigs[escId]?.inputsConfig;

  if (!esc || !measurementConfig) {
    return {};
  }
  return getYAxisConfig(type, measurementConfig);
};

export const getErrorYAxis = () => {
  return { ...yAxisSettings, min: 0, max: 1, show: false };
};

export const getPlotData = (
  robot: Robot,
  config: RobotConfig,
  plots: Plot[],
) => {
  const series = plots.map((plot) => {
    switch (plot.type) {
      case "data":
        return getDataSeries(robot, plot);
      case "input":
        return getInputSeries(robot, plot);
      case "error":
        return getErrorSeries(robot, plot);
      default:
        throw Error("unhandled plot data");
    }
  });
  const xAxis = getXAxis();
  const yAxis = plots.map((plot) => {
    switch (plot.type) {
      case "data":
        return getDataYAxis(robot, config, plot);
      case "input":
        return getInputYAxis(robot, config, plot);
      case "error":
        return getErrorYAxis();
    }
  });

  return {
    series,
    xAxis,
    yAxis,
  };
};

export const getLabel = (plot: Plot, timestamp: number, value: number) => {
  const formattedTimestamp = `(${timestamp / 1000} sec)`;
  let labelEntries: string[] = [String(value)];
  switch (plot.type) {
    case "data": {
      const unit = METADATA[plot.measurementName].unit;
      labelEntries.push(unit);
      break;
    }
    case "input": {
      const unit = METADATA[INPUT].unit;
      labelEntries.push(unit);
      break;
    }
    default:
      return null;
  }
  labelEntries.push(formattedTimestamp);
  return labelEntries.join(" ");
};

export const getAvailablePlots = (escId: EscId, esc: ESC): Plot[] => {
  let plots: Plot[] = [];

  (Object.entries(esc.data.measurements) as [MeasurementName, Measurement][])
    .filter(([_, measurement]) => measurement.values.length > 0)
    .map<Plot>(([measurementName]) => {
      return {
        escId,
        type: "data",
        measurementName,
      };
    })
    .forEach((plot) => plots.push(plot));

  if (esc.inputs.timestamps.length > 0) {
    plots.push({
      escId,
      type: "input",
    });
  }

  if (esc.errors.length > 0) {
    plots.push({
      escId,
      type: "error",
    });
  }
  return plots;
};
