import { useState } from "react";
import { GraphDisplay } from "./GraphDisplay";
import styled from "styled-components";
import { useRobot } from "../../../store";
import { Container, ControlsSection } from "../../../styles";
import { RobotImporter } from "../../../RobotImporter";
import { FullscreenButton } from "../../../FullscreenButton";

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
  padding: 4px;
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

const GraphWidthButton = styled(RoundButton)`
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

type GraphConfig = {
  id: UUID;
  isFullWidth: boolean;
};

export const GraphGrid = () => {
  const robot = useRobot();
  const emptyGraph = {
    id: crypto.randomUUID(),
    isFullWidth: true,
  };
  const [graphConfigs, setGraphConfigs] = useState<GraphConfig[]>([emptyGraph]);

  if (!robot) {
    return <div>No robot</div>;
  }

  const deleteGraph = (index: number) =>
    setGraphConfigs(graphConfigs.filter((_, i) => i !== index));

  const addGraph = () =>
    setGraphConfigs([
      ...graphConfigs,
      {
        id: crypto.randomUUID(),
        isFullWidth: true,
      },
    ]);

  const toggleGraphWidth = (index: number) => {
    const updatedGraphs = [...graphConfigs];
    updatedGraphs[index].isFullWidth = !updatedGraphs[index].isFullWidth;
    setGraphConfigs(updatedGraphs);
  };

  const moveGraphLeft = (index: number) => {
    const updatedGraphs = [...graphConfigs];
    [updatedGraphs[index], updatedGraphs[index - 1]] = [
      updatedGraphs[index - 1],
      updatedGraphs[index],
    ];
    setGraphConfigs(updatedGraphs);
  };

  const moveGraphRight = (index: number) => {
    const updatedGraphs = [...graphConfigs];
    [updatedGraphs[index], updatedGraphs[index + 1]] = [
      updatedGraphs[index + 1],
      updatedGraphs[index],
    ];
    setGraphConfigs(updatedGraphs);
  };

  return (
    <Holder>
      <ControlsSection>
        <RobotImporter />
      </ControlsSection>

      <GridHolder>
        {graphConfigs.map((graph, index) => {
          const { id, isFullWidth } = graph;
          return (
            <GraphHolder key={id} $isFullWidth={isFullWidth}>
              <ButtonsHolder>
                <RoundButton title="Delete" onClick={() => deleteGraph(index)}>
                  ✖
                </RoundButton>
                <ControlsButtons>
                  {index > 0 && (
                    <RoundButton
                      title="Move left"
                      onClick={() => moveGraphLeft(index)}
                    >
                      ←
                    </RoundButton>
                  )}
                  <GraphWidthButton
                    title={isFullWidth ? "Shrink" : "Expand"}
                    onClick={() => {
                      toggleGraphWidth(index);
                    }}
                  >
                    {isFullWidth ? "↦↤" : "⇤⇥"}
                  </GraphWidthButton>

                  {index < graphConfigs.length - 1 && (
                    <RoundButton
                      title="Move right"
                      onClick={() => moveGraphRight(index)}
                    >
                      →
                    </RoundButton>
                  )}
                </ControlsButtons>
              </ButtonsHolder>
              <GraphDisplay key={id} />
            </GraphHolder>
          );
        })}
      </GridHolder>
      <button onClick={addGraph}>+ New</button>
    </Holder>
  );
};
