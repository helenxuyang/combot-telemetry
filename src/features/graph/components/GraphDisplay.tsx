import ReactECharts from "echarts-for-react";
import { useRef, useState } from "react";
import { ESC, EscId, INPUT } from "../../../robot";

import styled from "styled-components";
import { PlotPill } from "../../../PlotPill";
import { useRobot, useRobotConfig } from "../../../store";
import {
  getAvailablePlots,
  getLabel,
  getPlotData,
  parsePlot,
  stringifyPlot,
  type Plot,
} from "../graphUtils";

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
`;

export const GraphDisplay = () => {
  const robot = useRobot();
  const config = useRobotConfig();

  const [zoomRange, setZoomRange] = useState<number>(100);

  const graphRef = useRef<ReactECharts>(null);

  if (!robot || !config) {
    return <div>No robot/config</div>;
  }

  if (Object.keys(robot.escs).length === 0) {
    return <div>No ESCs</div>;
  }

  const defaultEscId = Object.keys(robot.escs)[0] as EscId;
  const [plots, setPlots] = useState<Plot[]>([
    {
      escId: defaultEscId,
      type: "data",
      measurementName: INPUT,
    },
  ]);

  const { xAxis, yAxis, series } = getPlotData(robot, config, plots, zoomRange);

  const option = {
    xAxis,
    yAxis: yAxis.map((y, index) => ({
      ...y,
      offset: index > 1 ? (index - 1) * 45 : 0,
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
    grid: { bottom: 110, left: 100 },
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
        type: "inside",
        filterMode: "none",
      },
      {
        type: "slider",
        filterMode: "none",
      },
    ],
    animation: false,
  };

  console.log({ option, zoomRange });

  const dataZoom = (params: any) => {
    console.log(params);
    if ("batch" in params) {
      for (const zoom of params.batch) {
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
      if (params.dataZoomId.includes("series")) {
        if (params.end - params.start) {
          setZoomRange(params.end - params.start);
        }
      }
    }
  };

  const onEvents = { dataZoom };

  return (
    <div>
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
                return (
                  <PlotPill
                    name={
                      plot.type === "data" ? plot.measurementName : plot.type
                    }
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
        <div>
          <ReactECharts
            ref={graphRef}
            option={option}
            // onEvents={onEvents}
            notMerge={true}
            style={{ height: "90dvh", width: "100%" }}
          />
        </div>
      )}
    </div>
  );
};
