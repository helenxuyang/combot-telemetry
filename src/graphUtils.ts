import {
  type Robot,
  type EscName,
  type MeasurementName,
  INPUT,
  type Input,
  type Measurement,
  ERROR,
  POWER,
  VOLTAGE,
  CURRENT,
} from "./robot";

type DataPlot = {
  escName: EscName;
  type: "data";
  measurementName: MeasurementName;
};

type InputPlot = {
  escName: EscName;
  type: typeof INPUT;
};

type PowerPlot = {
  escName: EscName;
  type: typeof POWER;
};

type ErrorPlot = {
  escName: EscName;
  type: typeof ERROR;
};

export type Plot = DataPlot | InputPlot | PowerPlot | ErrorPlot;
export type PlotMeasurementName =
  | MeasurementName
  | typeof POWER
  | typeof INPUT
  | typeof ERROR;

export const stringifyPlot = (plot: Plot) => {
  if (plot.type === "data") {
    return `${plot.escName}-${plot.measurementName}`;
  } else {
    return `${plot.escName}-${plot.type}`;
  }
};

export const parsePlot = (id: string): Plot => {
  const idComponents = id.split("-");
  const escName = idComponents[0] as EscName;
  const part = idComponents[1];
  if (part === INPUT || part === ERROR) {
    return {
      escName,
      type: part,
    };
  } else {
    return {
      escName,
      type: "data",
      measurementName: part as MeasurementName,
    };
  }
};

export const getMeasurementOrInput = (
  robot: Robot,
  esc: EscName,
  key: PlotMeasurementName,
): Input | Measurement => {
  return key === INPUT
    ? robot.escs[esc].inputs
    : robot.escs[esc].measurements[key];
};

export const getSeriesColor = (measurementName: PlotMeasurementName) => {
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
    case "power":
      return "purple";
    case "input":
      return "gray";
    default:
      return "black";
  }
};

export const getSeries = (
  robot: Robot,
  escName: EscName,
  measurementName: MeasurementName | typeof INPUT,
) => {
  const measurement =
    measurementName === INPUT
      ? robot.escs[escName].inputs
      : robot.escs[escName].measurements[measurementName];

  const timestamps = robot.escs[escName].timestamps.filter(
    (_, index) => !isNaN(measurement.values[index]),
  );
  const values = measurement.values.filter((val) => !isNaN(val));

  if (!timestamps) {
    return {};
  }
  const seriesData = [
    ...timestamps.map((time, index) => {
      return [time, values[index]];
    }),
  ];
  const series = {
    id: `${escName} ${measurementName}`,
    type: "line",
    name: `${escName} ${measurementName}`,
    data: seriesData,
    // showSymbol: false,
    symbolSize: 2,
    itemStyle: {
      color: getSeriesColor(measurementName),
    },
  };
  return series;
};

export const getInputSeries = (robot: Robot, escName: EscName) => {
  let { timestamps, values } = robot.escs[escName].inputs;
  const { min, max } = robot.escs[escName].inputs;

  if (!timestamps) {
    return {};
  }

  timestamps = timestamps.filter((_, index) => !isNaN(values[index]));
  values = values.filter((val) => !isNaN(val));

  const spikeFilterThreshold = 1.5;
  timestamps = timestamps.filter((_, index) => {
    const val = values[index];
    return (
      val >= min * spikeFilterThreshold && val <= max * spikeFilterThreshold
    );
  });
  values = values.filter(
    (val) =>
      val >= min * spikeFilterThreshold && val <= max * spikeFilterThreshold,
  );

  const seriesData = [
    ...timestamps.map((time, index) => {
      return [time, values[index]];
    }),
  ];
  const series = {
    id: `${escName} ${INPUT}`,
    type: "line",
    name: `${escName} ${INPUT}`,
    data: seriesData,
    symbolSize: 2,
    itemStyle: {
      color: getSeriesColor(INPUT),
    },
  };
  return series;
};

// TODO: power isn't showing up, not sure why
export const getPowerSeries = (robot: Robot, escName: EscName) => {
  const timestamps = robot.escs[escName].timestamps;
  const esc = robot.escs[escName];
  const voltage = esc.measurements[VOLTAGE];
  const current = esc.measurements[CURRENT];
  const values = voltage.values
    .map((val, index) => val * current.values[index])
    .filter((val) => !isNaN(val));
  const seriesData = [
    ...timestamps.map((time, index) => {
      return [time, values[index]];
    }),
  ];
  const series = {
    id: `${escName} ${POWER}`,
    type: "line",
    name: `${escName} ${POWER}`,
    data: seriesData,
    symbolSize: 2,
  };
  return series;
};

export const getXAxis = (timestamps: number[]) => {
  const axis = {
    name: "seconds",
    nameLocation: "middle",
    max: timestamps.at(-1) ?? 0,
    axisLabel: {
      formatter: (value: string) => {
        const sec = Number(value) / 1000;
        return sec.toFixed(sec % 1 === 0 ? 0 : 2);
      },
    },
  };
  return axis;
};

const yAxisSettings = {
  axisLine: { onZero: false },
  axisLabel: { fontSize: 10 },
  nameTextStyle: {
    fontSize: 10,
  },
  splitNumber: 10,
};
export const getYAxis = (
  robot: Robot,
  escName: EscName,
  measurementName: PlotMeasurementName,
) => {
  const measurement = getMeasurementOrInput(robot, escName, measurementName);
  const axis = {
    type: "value",
    name: `${measurement.unit.length > 0 ? measurement.unit : measurementName}`,
    min:
      measurementName === INPUT
        ? measurement.min
        : Math.min(...measurement.values.filter((val) => !isNaN(val))),
    max:
      measurementName === INPUT
        ? measurement.max
        : Math.max(...measurement.values.filter((val) => !isNaN(val))),
    ...yAxisSettings,
  };
  return axis;
};

export const getPowerYAxis = (robot: Robot, escName: EscName) => {
  const esc = robot.escs[escName];
  const voltage = esc.measurements[VOLTAGE];
  const current = esc.measurements[CURRENT];
  const values = voltage.values
    .map((val, index) => val * current.values[index])
    .map((val) => Number(val.toFixed(2)));
  const axis = {
    type: "value",
    name: "W",
    min: Math.min(...values.filter((val) => !isNaN(val))),
    max: Math.max(...values.filter((val) => !isNaN(val))),
    ...yAxisSettings,
  };
  return axis;
};

export const parsePlotData = (robot: Robot, plots: Plot[]) => {
  const dataPlots = plots.filter((plot) => plot.type === "data");
  const dataXAxes = dataPlots.map(({ escName }, index) => {
    return {
      ...getXAxis(robot.escs[escName].timestamps),
      show: index === 0,
    };
  });
  const dataYAxes = dataPlots.map(({ escName, measurementName }) => {
    return getYAxis(robot, escName, measurementName);
  });
  const dataSeries = dataPlots.map((plot) => {
    return getSeries(robot, plot.escName, plot.measurementName);
  });

  const inputPlots = plots.filter((plot) => plot.type === INPUT);
  const inputXAxes = inputPlots.map((plot) => {
    return {
      ...getXAxis(robot.escs[plot.escName].inputs.timestamps),
      show: false,
    };
  });
  const inputYAxes = inputPlots.map(({ escName }) => {
    return getYAxis(robot, escName, INPUT);
  });
  const inputSeries = inputPlots.map(({ escName }) =>
    getInputSeries(robot, escName),
  );

  const powerPlots = plots.filter((plot) => plot.type === POWER);
  const powerXAxis = powerPlots.map(({ escName }) => {
    return {
      ...getXAxis(robot.escs[escName].timestamps),
    };
  });
  const powerYAxis = powerPlots.map(({ escName }) => {
    return getPowerYAxis(robot, escName);
  });
  const powerSeries = powerPlots.map(({ escName }) => {
    return {
      ...getPowerSeries(robot, escName),
    };
  });

  const errorPlots = plots.filter((plot) => plot.type === ERROR);
  const errorSeries = errorPlots
    .map((plot) => {
      const escErrors = robot.escs[plot.escName].errors;
      return {
        type: "line",
        name: `${plot.escName} ${ERROR}`,
        markLine: {
          silent: true,
          symbolSize: 5,
          data: escErrors.map((error) => {
            return {
              name: `error ${error.errorCode} `,
              xAxis: error.timestamp,
            };
          }),
          label: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              return params.seriesName;
            },
          },
        },
      };
    })
    .flat();

  return {
    series: [...dataSeries, ...inputSeries],
    errorSeries,
    powerSeries,
    xAxis: [...dataXAxes, ...inputXAxes],
    powerXAxis: powerXAxis,
    yAxis: [...dataYAxes, ...inputYAxes],
    powerYAxis: powerYAxis,
  };
};
