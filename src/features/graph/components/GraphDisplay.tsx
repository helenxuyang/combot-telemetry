import ReactECharts from "echarts-for-react";
import { useRef, useState } from "react";
import styled from "styled-components";
import { PlotPill } from "../../../PlotPill";
import { ESC, EscId, INPUT } from "../../../robot";
import { useRobot, useRobotConfig } from "../../../store";
import { media } from "../../../styles";
import {
  getAvailablePlots,
  getLabel,
  getPlotData,
  parsePlot,
  stringifyPlot,
  type Plot,
} from "../graphUtils";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const PlotSelectionHolder = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PillHolder = styled.div`
  display: flex;
  gap: 2px;
  margin: 2px;
  align-items: center;
  ${media.small} {
    flex-wrap: wrap;
  }
`;

const zLevels = {
  yAxisSlider: 1,
  yAxis: 2,
};
const yAxisWidth = 40;
const bottomControlsHeight = 110;

export const GraphDisplay = () => {
  const robot = useRobot();
  const config = useRobotConfig();

  const [yAxisSlidersVisible, setYAxisSlidersVisible] =
    useState<boolean>(false);
  const [zoomRange, setZoomRange] = useState<number>(100);
  const [yAxisZoomRanges, setYAxisZoomRanges] = useState<
    Record<string, { start: number; end: number }>
  >({});

  const graphRef = useRef<ReactECharts>(null);

  const defaultEscId: EscId = robot
    ? (Object.keys(robot.escs)[0] as EscId)
    : "0";
  const [plots, setPlots] = useState<Plot[]>([
    {
      escId: defaultEscId,
      type: "data",
      measurementName: INPUT,
    },
  ]);

  const { xAxis, yAxis, series } =
    robot && config
      ? getPlotData(robot, config, plots, zoomRange)
      : { xAxis: [], yAxis: [], series: [] };

  if (!robot || !config) {
    return <div>No robot/config</div>;
  }

  if (Object.keys(robot.escs).length === 0) {
    return <div>No ESCs</div>;
  }

  const option = {
    xAxis,
    yAxis: yAxis.map((y, index) => ({
      ...y,
      position: "left",
      offset: (yAxis.length - 1 - index) * yAxisWidth,
      z: zLevels["yAxis"],
      triggerEvent: true,
      axisLabel: {
        ...y?.axisLabel,
        formatter: (value: string) => (yAxisSlidersVisible ? "" : value),
      },
    })),
    series: series.map((s, index) => ({
      ...s,
      yAxisIndex: index,
    })),
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
        const plot = parsePlot(params.seriesId);
        const escName = params.seriesName.split(" ")[0];
        const timestamp = params.value[0];
        const value = params.value[1];
        return getLabel(plot, timestamp, value, escName);
      },
      textStyle: {
        fontSize: 10,
      },
      backgroundColor: "white",
      padding: 2,
      borderWidth: 0,
    },
    grid: { bottom: bottomControlsHeight, left: yAxis.length * yAxisWidth },
    toolbox: {
      feature: {
        // select rectangle to zoom
        dataZoom: {
          show: true,
        },
      },
    },
    dataZoom: [
      {
        id: "series-inside",
        type: "inside",
        filterMode: "none",
      },
      {
        id: "series-slider",
        type: "slider",
        filterMode: "none",
      },

      ...yAxis.map((_, index) => {
        const dataZoomId = `yAxis-slider-${stringifyPlot(plots[index])}`;
        const zoom = yAxisZoomRanges[dataZoomId];
        return {
          id: dataZoomId,
          type: "slider",
          filterMode: "none",
          ...zoom,
          yAxisIndex: index,
          orient: "vertical",
          left: index * yAxisWidth,
          width: yAxisWidth * 0.75,
          z: zLevels["yAxisSlider"],
          show: yAxisSlidersVisible,
          handleLabel: {
            show: true,
          },
        };
      }),
    ],
    animation: false,
  };

  console.log({ option });

  const toggleYAxisSliderVisibility = (params: any) => {
    if (params.componentType === "yAxis") {
      setYAxisSlidersVisible((visible) => !visible);
    }
  };

  const handleZoom = (params: any) => {
    console.log("dataZoom", params);
    const yAxisZoomUpdates: Record<string, { start: number; end: number }> = {};
    const recordYAxisZoom = (zoom: any) => {
      if (zoom.dataZoomId.startsWith("yAxis-slider-")) {
        yAxisZoomUpdates[zoom.dataZoomId] = {
          start: zoom.start,
          end: zoom.end,
        };
      }
    };

    if ("batch" in params) {
      for (const zoom of params.batch) {
        recordYAxisZoom(zoom);
        // scroll zoom - gives percent
        if (zoom.dataZoomId.includes("series")) {
          setZoomRange(zoom.end - zoom.start);
        }
        // rectangle zoom - gives absolute values for all axes
        else if (zoom.dataZoomId.includes("toolbox")) {
        }
      }
    }
    // slider zoom - gives percent
    else {
      recordYAxisZoom(params);
      if (params.dataZoomId.includes("series")) {
        if (params.end - params.start) {
          setZoomRange(params.end - params.start);
        }
      }
    }

    if (Object.keys(yAxisZoomUpdates).length > 0) {
      setYAxisZoomRanges((ranges) => ({ ...ranges, ...yAxisZoomUpdates }));
    }
  };

  const onEvents = {
    click: toggleYAxisSliderVisibility,
    dataZoom: handleZoom,
  };

  return (
    <Container>
      <PlotSelectionHolder>
        {(Object.entries(robot.escs) as [EscId, ESC][]).map(([escId, esc]) => {
          const availablePlots = getAvailablePlots(escId, esc);
          return (
            <PillHolder key={esc.name}>
              <strong>{esc.name}: </strong>
              {availablePlots.map((plot) => {
                const isSelected =
                  plots.filter(
                    (plotId) => stringifyPlot(plotId) === stringifyPlot(plot),
                  ).length > 0;
                const plotType =
                  plot.type === "data" ? plot.measurementName : plot.type;
                return (
                  <PlotPill
                    key={`${escId}-${plotType}`}
                    name={plotType}
                    escId={escId}
                    isSelected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setPlots((ids) =>
                          ids.filter(
                            (plotId) =>
                              stringifyPlot(plotId) !== stringifyPlot(plot),
                          ),
                        );
                      } else {
                        setPlots((ids) => [...ids, plot]);
                      }
                    }}
                  />
                );
              })}
            </PillHolder>
          );
        })}
      </PlotSelectionHolder>
      {plots.length > 0 && (
        <div style={{ flex: 1, width: "100%" }}>
          <ReactECharts
            ref={graphRef}
            option={option}
            onEvents={onEvents}
            style={{ height: "100%", width: "100%" }}
            notMerge={false}
            replaceMerge={["series", "xAxis", "yAxis", "dataZoom"]}
            lazyUpdate={true}
          />
        </div>
      )}
    </Container>
  );
};
