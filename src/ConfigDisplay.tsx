import { useState } from "react";
import { type EscName, type MeasurementName } from "./robot";
import styled from "styled-components";
import {
  deleteRobotConfig,
  getConfigFromRobot,
  getCurrentRobotConfig,
  getCurrentRobotName,
  getRobotConfigs,
  initRobotFromConfig,
  isDefaultConfig,
  saveRobotConfig,
  type MeasurementConfig,
  type RobotConfig,
} from "./storageUtils";
import { useRobot, useSetRobot } from "./store";

const ConfigLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const PrebuiltRobotsLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EscLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  gap: 16px;
  justify-content: center;
`;

const MeasurementLayout = styled.div`
  display: grid;
  padding: 16px;
  gap: 8px;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid black;
`;

const StyledInput = styled.input<{ $shouldHighlight: boolean }>`
  width: 100px;
  ${({ $shouldHighlight }) => {
    return $shouldHighlight && "outline: 2px orange dashed;";
  }};
`;

const UnsavedWarning = styled.div`
  color: darkorange;
`;

const CustomConfigButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const ConfigDisplay = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();

  const [robotInput, setRobotInput] = useState<RobotConfig>(
    getConfigFromRobot(robot),
  );

  const robotConfigsMap = getRobotConfigs();
  const robotConfigs = Object.values(robotConfigsMap);

  const updateRobotInput = (mutation: (input: RobotConfig) => void) => {
    const newRobotInput = structuredClone(robotInput);
    mutation(newRobotInput);
    setRobotInput(newRobotInput);
  };

  const getShouldHighlight = (
    escName: EscName,
    measurementName: MeasurementName,
    key: keyof MeasurementConfig,
  ) => {
    return (
      robotInput.escConfigs[escName].measurementConfigs[measurementName][
        key
      ] !== robot.escs[escName].measurements[measurementName][key]
    );
  };

  const onSelectConfig = (config: RobotConfig) => {
    saveRobotConfig(config);
    setRobot(initRobotFromConfig(config));
    setRobotInput(config);
  };

  return (
    <ConfigLayout>
      <PrebuiltRobotsLayout>
        <h2>Configs</h2>
        {robotConfigs.map((config) => {
          return (
            config.name !== getCurrentRobotName() && (
              <CustomConfigButtons key={config.name}>
                <button
                  key={config.name}
                  onClick={() => onSelectConfig(config)}
                >
                  Switch to {config.name}
                </button>

                {!isDefaultConfig(config.name) && (
                  <button
                    key={`${config.name}-delete`}
                    onClick={() => {
                      deleteRobotConfig(config.name);
                      setRobotInput(getCurrentRobotConfig());
                    }}
                  >
                    🗑️
                  </button>
                )}
              </CustomConfigButtons>
            )
          );
        })}
      </PrebuiltRobotsLayout>

      <h2>Create/Edit</h2>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        value={robotInput.name}
        onChange={(e) => {
          updateRobotInput((config) => {
            config.name = e.target.value;
          });
        }}
      ></input>
      <EscLayout>
        {Object.values(robotInput.escConfigs).map((esc) => {
          return (
            <div key={esc.name}>
              <h3>{esc.name}</h3>
              <MeasurementLayout key={esc.name}>
                {Object.values(esc.measurementConfigs).map((measurement) => {
                  const { name, min, max } = measurement;
                  const measurementId = `${esc.name}-${name}`;
                  const isMinUnsaved = getShouldHighlight(
                    esc.name,
                    name,
                    "min",
                  );
                  const isMaxUnsaved = getShouldHighlight(
                    esc.name,
                    name,
                    "max",
                  );
                  return (
                    <div key={`${esc.name}-${measurement.name}`}>
                      <h4>{name}</h4>
                      <label htmlFor={measurementId}>Min: </label>
                      <StyledInput
                        id={measurementId}
                        value={min}
                        type="number"
                        onChange={(e) => {
                          updateRobotInput((robot: RobotConfig) => {
                            robot.escConfigs[esc.name].measurementConfigs[
                              measurement.name
                            ].min = Number(e.target.value);
                          });
                        }}
                        $shouldHighlight={isMinUnsaved}
                      ></StyledInput>
                      <br />
                      <label htmlFor={measurementId}>Max: </label>
                      <StyledInput
                        id={measurementId}
                        value={max}
                        type="number"
                        onChange={(e) => {
                          updateRobotInput((robot: RobotConfig) => {
                            robot.escConfigs[esc.name].measurementConfigs[
                              measurement.name
                            ].max = Number(e.target.value);
                          });
                        }}
                        $shouldHighlight={isMaxUnsaved}
                      ></StyledInput>
                      {(isMinUnsaved || isMaxUnsaved) && (
                        <UnsavedWarning>⚠ Unsaved</UnsavedWarning>
                      )}
                    </div>
                  );
                })}
              </MeasurementLayout>
            </div>
          );
        })}
      </EscLayout>
      <button
        onClick={() => {
          saveRobotConfig(robotInput);
          setRobot(initRobotFromConfig(robotInput));
        }}
      >
        Save
      </button>
    </ConfigLayout>
  );
};
