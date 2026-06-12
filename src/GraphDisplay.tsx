import ReactECharts from "echarts-for-react";
import { ERROR, INPUT, POWER, type Robot } from "./robot";
import { useCallback, useMemo, useRef, useState } from "react";

import styled from "styled-components";
import { StatusDot } from "./StatusDot";
import {
  getXAxis,
  parsePlotData,
  stringifyPlot,
  type Plot,
} from "./graphUtils";
import { PlotPill } from "./PlotPill";

const AutoscrollHolder = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: end;

  font-size: 12px;
  button {
    padding: 4px 8px;
  }
`;

const PillHolder = styled.div`
  display: flex;
  gap: 2px;
  margin: 2px;
  align-items: center;
`;

type Props = {
  robot: Robot;
};

export const GraphDisplay = ({ robot }: Props) => {
  const graphRef = useRef<ReactECharts>(null);
  const [plotIds, setPlotIds] = useState<Plot[]>(
    Object.keys(robot.escs).length > 0
      ? [
          {
            escName: Object.values(robot.escs)[0].name,
            type: INPUT,
          },
        ]
      : [],
  );
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [lastZoomValues, setLastZoomValues] = useState<{
    startValue?: number;
    endValue?: number;
  }>({});

  const onZoom = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      if (event.dataZoomId !== "xZoom") {
        return;
      }
      if (isAutoScrolling) {
        setIsAutoScrolling(false);
      }
      setLastZoomValues({
        // @ts-expect-error echarts is bad at types
        startValue: graphRef.current?.getEchartsInstance().getOption()
          .dataZoom[0].startValue,
        // @ts-expect-error echarts is bad at types
        endValue: graphRef.current?.getEchartsInstance().getOption().dataZoom[0]
          .endValue,
      });
    },
    [isAutoScrolling],
  );

  const onEvents = useMemo(() => ({ datazoom: onZoom }), [onZoom]);

  const referenceTimestamps = Object.values(robot.escs)[0].timestamps;

  const autoscrollStart =
    referenceTimestamps.length > 0
      ? referenceTimestamps[referenceTimestamps.length - 1] - 5000
      : 0;

  const plotDataOptions = parsePlotData(robot, plotIds);

  const defaultXAxis = { ...getXAxis(referenceTimestamps), show: true };
  const defaultYAxis = {
    type: "value",
    name: "errors",
    min: 0,
    max: 1,
  };
  const defaultSeries = {
    id: "placeholder-series",
    type: "line",
    data: referenceTimestamps.map((timestamp) => [timestamp, -1]),
    // showSymbol: false,
    symbolSize: 2,
    silent: true,
  };
  const hasOnlyErrors =
    plotDataOptions.xAxis.length === 0 &&
    plotDataOptions.errorSeries.length > 0;

  const hasOnlyPower =
    plotDataOptions.series.length === 0 &&
    plotDataOptions.powerSeries.length > 0;

  const finalXAxis = [
    ...(hasOnlyErrors ? [defaultXAxis] : plotDataOptions.xAxis),
    ...(hasOnlyPower ? plotDataOptions.powerXAxis : []),
  ];

  const finalYAxis = [
    ...(hasOnlyErrors
      ? [defaultYAxis]
      : plotDataOptions.yAxis.map((yAxis, index) => ({
          ...yAxis,
          offset: index > 1 ? (index - 1) * 45 : 0,
        }))),
    ...(hasOnlyPower ? plotDataOptions.powerYAxis : []),
  ];

  const finalSeries = [
    ...plotDataOptions.series.map((series, index) => {
      return {
        ...series,
        yAxisIndex: index,
        xAxisIndex: index,
      };
    }),
    ...plotDataOptions.errorSeries,
    hasOnlyErrors && defaultSeries,
    ...(hasOnlyPower ? plotDataOptions.powerSeries : []),
    ...robot.matchMarkers.map((marker) => {
      return {
        type: "line",
        name: marker.type,
        markLine: {
          silent: true,
          symbolSize: 5,
          data: [{ xAxis: marker.timestamp }],
          label: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              return params.seriesName;
            },
          },
        },
      };
    }),
  ].filter(Boolean);

  const option = {
    xAxis: finalXAxis,
    yAxis: finalYAxis,
    series: finalSeries,
    legend: {
      bottom: 50,
    },
    tooltip: {
      show: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        if (params.componentType === "markLine") {
          return;
        }
        const [escName, measurementOrInputName] = params.seriesName.split(" ");

        let unit = "";
        if (measurementOrInputName === INPUT) {
          unit = robot.escs[escName].inputs.unit;
        } else if (measurementOrInputName === POWER) {
          unit = "W";
        } else {
          unit =
            robot.escs[escName].measurements[measurementOrInputName].unit ??
            null;
        }
        return [params.value[1], unit, `(${params.value[0] / 1000} sec)`].join(
          " ",
        );
      },
      textStyle: {
        fontSize: 10,
      },
      backgroundColor: "white",
      padding: 2,
      borderWidth: 0,
    },
    grid: { bottom: 110, left: 100 },
    dataZoom: [
      {
        id: "xZoom",
        type: "slider",
        show: true,
        xAxisIndex: [...Array(plotIds.length).keys()],
        startValue: isAutoScrolling
          ? autoscrollStart
          : lastZoomValues.startValue,
        endValue: isAutoScrolling ? undefined : lastZoomValues.endValue,
        filterMode: "none",
      },
      {
        type: "slider",
        show: true,
        yAxisIndex: [...Array(plotIds.length).keys()],
        filterMode: "none",
        left: 0,
      },
      {
        type: "inside",
        show: true,
        xAxisIndex: [0],
        filterMode: "none",
      },
      {
        type: "inside",
        show: true,
        yAxisIndex: [0],
        filterMode: "none",
      },
    ],
    toolbox: {
      feature: {
        // select rectangle to zoom
        dataZoom: {
          show: true,
        },
      },
    },
    animation: false,
  };

  const toggleAutoScrolling = useCallback(() => {
    if (isAutoScrolling) {
      setLastZoomValues({
        startValue: autoscrollStart ?? 0,
        endValue: referenceTimestamps.at(-1) ?? 0,
      });
    } else {
      setLastZoomValues({});
    }
    setIsAutoScrolling((scrolling) => !scrolling);
  }, [autoscrollStart, isAutoScrolling, referenceTimestamps]);

  return (
    <div>
      {Object.values(robot.escs).map((esc) => {
        const plots = [
          ...Object.values(esc.measurements)
            .map((measurement) => {
              return measurement.name;
            })
            .map((name) => ({
              escName: esc.name,
              type: "data",
              measurementName: name,
            })),
          {
            escName: esc.name,
            type: INPUT,
          },
          {
            escName: esc.name,
            type: POWER,
          },
          {
            escName: esc.name,
            type: ERROR,
          },
        ] as Plot[]; // TODO: figure out types

        return (
          <PillHolder key={esc.name}>
            <strong>{esc.name}: </strong>
            {plots.map((plot) => {
              const isSelected =
                plotIds.filter(
                  (plotId) => stringifyPlot(plotId) === stringifyPlot(plot),
                ).length > 0;
              return (
                <PlotPill
                  name={plot.type === "data" ? plot.measurementName : plot.type}
                  isSelected={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      setPlotIds((ids) =>
                        ids.filter(
                          (plotId) =>
                            stringifyPlot(plotId) !== stringifyPlot(plot),
                        ),
                      );
                    } else {
                      setPlotIds((ids) => [...ids, plot]);
                    }
                  }}
                />
              );
            })}
          </PillHolder>
        );
      })}
      {plotIds.length > 0 && (
        <div>
          <ReactECharts
            ref={graphRef}
            option={option}
            notMerge={true}
            onEvents={onEvents}
            style={{ height: "700px", width: "100%" }}
          />
          <AutoscrollHolder>
            <span>
              {isAutoScrolling && <StatusDot dot="🟢" />} Auto-scroll{" "}
            </span>
            <button onClick={toggleAutoScrolling}>
              {isAutoScrolling ? "⏸" : "▶"}
            </button>
          </AutoscrollHolder>
        </div>
      )}
    </div>
  );
};
