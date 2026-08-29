import { METADATA } from "../../displayUtils";
import {
  type MeasurementName,
  type Robot,
  ERROR,
  ESC,
  EscId,
} from "../../robot";
import { MeasurementConfig, RobotConfig } from "../configuration/configUtils";

type DataPlot = {
  escId: EscId;
  type: "data";
  measurementName: MeasurementName;
};

type ErrorPlot = {
  escId: EscId;
  type: typeof ERROR;
};

export type Plot = DataPlot | ErrorPlot;

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
  if (part === ERROR) {
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

const SERIES_COLORS: Record<
  MeasurementName | typeof ERROR,
  [string, string, string, string]
> = {
  temperature: ["#7A0000", "#F06262", "#B00020", "#D32F2F"],
  rpm: ["#B83D00", "#FFB703", "#E85D04", "#F48C06"],
  voltage: ["#8A6500", "#E8C547", "#B88600", "#D4A017"],
  current: ["#005A24", "#52B788", "#008C3A", "#00A651"],
  consumption: ["#003F88", "#4DA3E8", "#0057B8", "#0077CC"],
  input: ["#303030", "#A0A0A0", "#555555", "#787878"],
  error: ["black", "black", "black", "black"],
};

export const getSeriesColor = (
  measurementName: MeasurementName | typeof ERROR,
  escId: EscId,
): string => {
  return SERIES_COLORS[measurementName][escId];
};

export const getSeriesSymbol = (escId: EscId, zoomRange: number) => {
  const symbols = ["circle", "triangle", "diamond", "rect"];
  const sizes = [5, 7, 10, 5];
  const index = Number(escId);
  const baseSize = sizes[index];
  const minSize = baseSize;
  const maxSize = baseSize * 1.75;
  return {
    symbol: symbols[index],
    symbolSize: Math.max(minSize, Math.min(baseSize / zoomRange, maxSize)),
  };
};

export const getSeriesData = (timestamps: number[], values: number[]) => {
  return timestamps.map((time, index) => [time, values[index]]);
};

export const getSeriesConfig = (
  escId: EscId,
  escName: string,
  plotName: MeasurementName,
  zoomRange: number,
) => {
  const { symbol, symbolSize } = getSeriesSymbol(escId, zoomRange);
  return {
    id: `${escId}-${plotName}`,
    name: `${escName} ${plotName}`,
    type: "line",
    showSymbol: true,
    symbol,
    symbolSize,
    itemStyle: {
      color: getSeriesColor(plotName, escId),
    },
    // sampling: "lttb",
  };
};

export const getDataSeries = (
  robot: Robot,
  plot: DataPlot,
  zoomRange: number,
) => {
  const { escId, measurementName } = plot;
  const esc = robot.escs[escId];
  if (!esc) {
    return {};
  }
  const timestamps = esc.timestamps;
  const values = esc.data[measurementName];
  const seriesData = getSeriesData(timestamps, values);

  return {
    data: seriesData,
    ...getSeriesConfig(escId, esc.name, measurementName, zoomRange),
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
  name: MeasurementName,
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

export const getErrorYAxis = () => {
  return { ...yAxisSettings, min: 0, max: 1, show: false };
};

export const getPlotData = (
  robot: Robot,
  config: RobotConfig,
  plots: Plot[],
  zoomRange: number,
) => {
  const series = plots.map((plot) => {
    switch (plot.type) {
      case "data":
        return getDataSeries(robot, plot, zoomRange);
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

export const getLabel = (
  plot: Plot,
  timestamp: number,
  value: number,
  escName: string,
) => {
  const formattedTimestamp = `(${timestamp / 1000} sec)`;
  let labelEntries: string[] = [String(value)];
  switch (plot.type) {
    case "data": {
      const unit = METADATA[plot.measurementName].unit;
      labelEntries.push(unit);
      break;
    }
    default:
      return null;
  }
  labelEntries.push(formattedTimestamp);
  labelEntries.push(`[${escName}]`);
  return labelEntries.join(" ");
};

export const getAvailablePlots = (escId: EscId, esc: ESC): Plot[] => {
  let plots: Plot[] = [];

  (Object.entries(esc.data) as [MeasurementName, number[]][])
    .filter(([_, values]) => values.length > 0)
    .map<Plot>(([measurementName]) => {
      return {
        escId,
        type: "data",
        measurementName,
      };
    })
    .forEach((plot) => plots.push(plot));

  if (esc.errors.length > 0) {
    plots.push({
      escId,
      type: "error",
    });
  }
  return plots;
};
