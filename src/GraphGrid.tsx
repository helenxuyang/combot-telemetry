import { useState } from "react";
import { GraphDisplay } from "./GraphDisplay";
import styled from "styled-components";
import { useRobot } from "./store";

type UUID = `${string}-${string}-${string}-${string}-${string}`;

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GridHolder = styled.div`
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const GraphHolder = styled.div<{ $isFullWidth: boolean }>`
  box-sizing: border-box;
  flex-basis: ${({ $isFullWidth }) =>
    $isFullWidth ? "100%" : "calc(50% - 2px)"}; // to account for gap
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 2px solid #cccccc;
  padding: 16px 8px;
  gap: 8px;

  @media (max-width: 700px) {
    flex-basis: 100%;
  }
`;

const RoundButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  border: none;
  width: 24px;
  height: 24px;
  padding: 16px;
  border-radius: 50%;

  background-color: #cccccc;
  &:hover {
    background-color: #bbbbbb;
  }
`;

const PlotWidthButton = styled(RoundButton)`
  @media (max-width: 700px) {
    display: none;
  }
`;

const ButtonsHolder = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ControlsButtons = styled.div`
  display: flex;
  gap: 8px;
`;

type PlotConfig = {
  id: UUID;
  isFullWidth: boolean;
};
export const GraphGrid = () => {
  const robot = useRobot();
  const [plotConfigs, setPlotConfigs] = useState<PlotConfig[]>([]);

  const deletePlot = (index: number) =>
    setPlotConfigs(plotConfigs.filter((_, i) => i !== index));

  const addPlot = () =>
    setPlotConfigs([
      ...plotConfigs,
      {
        id: crypto.randomUUID(),
        isFullWidth: true,
      },
    ]);

  const togglePlotWidth = (index: number) => {
    const updatedPlots = [...plotConfigs];
    updatedPlots[index].isFullWidth = !updatedPlots[index].isFullWidth;
    setPlotConfigs(updatedPlots);
  };

  const movePlotLeft = (index: number) => {
    const updatedPlots = [...plotConfigs];
    [updatedPlots[index], updatedPlots[index - 1]] = [
      updatedPlots[index - 1],
      updatedPlots[index],
    ];
    setPlotConfigs(updatedPlots);
  };

  const movePlotRight = (index: number) => {
    const updatedPlots = [...plotConfigs];
    [updatedPlots[index], updatedPlots[index + 1]] = [
      updatedPlots[index + 1],
      updatedPlots[index],
    ];
    setPlotConfigs(updatedPlots);
  };

  return (
    <Holder>
      <GridHolder>
        {plotConfigs.map((plot, index) => {
          const { id, isFullWidth } = plot;
          return (
            <GraphHolder key={id} $isFullWidth={isFullWidth}>
              <ButtonsHolder>
                <RoundButton title="Delete" onClick={() => deletePlot(index)}>
                  ✖
                </RoundButton>
                <ControlsButtons>
                  {index > 0 && (
                    <RoundButton
                      title="Move left"
                      onClick={() => movePlotLeft(index)}
                    >
                      ←
                    </RoundButton>
                  )}
                  <PlotWidthButton
                    title={isFullWidth ? "Shrink" : "Expand"}
                    onClick={() => {
                      togglePlotWidth(index);
                    }}
                  >
                    {isFullWidth ? "↦↤" : "⇤⇥"}
                  </PlotWidthButton>

                  {index < plotConfigs.length - 1 && (
                    <RoundButton
                      title="Move right"
                      onClick={() => movePlotRight(index)}
                    >
                      →
                    </RoundButton>
                  )}
                </ControlsButtons>
              </ButtonsHolder>
              <GraphDisplay key={id} robot={robot} />
            </GraphHolder>
          );
        })}
      </GridHolder>
      <button onClick={addPlot}>+ New</button>
    </Holder>
  );
};
