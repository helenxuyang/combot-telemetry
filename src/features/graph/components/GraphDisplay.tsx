import ReactECharts from "echarts-for-react";
import { useRef, useState } from "react";
import styled from "styled-components";
import { METADATA } from "../../../displayUtils";
import { PlotPill } from "../../../PlotPill";
import { ESC, EscId, INPUT, SNR } from "../../../robot";
import { useRobot, useRobotConfig } from "../../../robotStore";
import { media, StyledPill } from "../../../styles";
import {
  getAvailablePlots,
  getLabel,
  getPlotData,
  getPointId,
  getPointLabel,
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
  const [labelledPoints, setLabelledPoints] = useState<string[]>([]); // format: timestamp:value

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
  const [showSnr, setShowSnr] = useState<boolean>(false);

  const { xAxis, yAxis, series, sliders } =
    robot && config
      ? getPlotData(robot, config, plots, zoomRange, showSnr)
      : { xAxis: [], yAxis: [], series: [], sliders: [] };

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
    series: series.map((s) => ({
      ...s,
      data: s.data.map((value: number[]) => ({
        value,
        label: {
          show: labelledPoints.includes(getPointId(s.id, value[1], value[0])),
          formatter: () => {
            const plot = parsePlot(s.id);
            if (plot.type !== "data") {
              return;
            }
            return getPointLabel({
              value: value[1],
              timestamp: value[0],
              unit: METADATA[plot.measurementName].unit,
            });
          },
          rich: {
            value: {
              fontWeight: "bold",
              fontSize: 14,
            },
          },
        },
      })),
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
        if (params.seriesId === SNR) {
          return params.value[1];
        }
        const plot = parsePlot(params.seriesId);
        if (plot.type !== "data") {
          return;
        }
        const escName = params.seriesName.split(" ")[0];
        const timestamp = params.value[0];
        const value = params.value[1];
        return getLabel({
          value,
          timestamp,
          unit: METADATA[plot.measurementName].unit,
          escName,
        });
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
          filterMode: "none",
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
        id: "xAxis-slider",
        type: "slider",
        filterMode: "none",
      },

      ...sliders.map((slider, index) => {
        const dataZoomId = `yAxis-slider-${stringifyPlot(plots[index])}`;
        const zoom = yAxisZoomRanges[dataZoomId];
        const width = yAxisWidth * 0.6;
        return {
          ...slider,
          left: index * yAxisWidth + width,
          width,
          z: zLevels["yAxisSlider"],
          show: yAxisSlidersVisible,
          ...zoom,
        };
      }),
    ],
    animation: false,
  };

  console.log({ option });

  const dispatchClickPoint = (params: any) => {
    if (params.componentType === "series") {
      const [timestamp, value] = params.data.value;
      const plot = parsePlot(params.seriesId);
      const { escId } = plot;

      const clickPointEvent = new CustomEvent("clickPoint", {
        detail: { timestamp, escId },
      });
      window.dispatchEvent(clickPointEvent);

      const formattedPoint = getPointId(params.seriesId, value, timestamp);
      if (labelledPoints.includes(formattedPoint)) {
        setLabelledPoints((points) =>
          points.filter((point) => point !== formattedPoint),
        );
      } else {
        setLabelledPoints((points) => [...points, formattedPoint]);
      }
    }
  };

  const toggleYAxisSliderVisibility = () => {
    setYAxisSlidersVisible((visible) => !visible);
  };

  const handleClick = (params: any) => {
    if (params.componentType === "yAxis") {
      toggleYAxisSliderVisibility();
    } else if (params.componentType === "series") {
      dispatchClickPoint(params);
    }
  };

  const handleZoom = (params: any) => {
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
    click: handleClick,
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
        <PillHolder>
          <strong>General: </strong>
          <StyledPill
            $isSelected={showSnr}
            $color="black"
            onClick={() => setShowSnr((show) => !show)}
          >
            SNR
          </StyledPill>
        </PillHolder>
      </PlotSelectionHolder>
      {(plots.length > 0 || showSnr) && (
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
