import { useEffect, useState } from "react";
import {
  getAllConfigNames,
  getCurrentRobotConfig,
  selectConfig,
} from "../configUtils";
import { useRobotConfig, useSetRobotConfig } from "../../../store";
import { ConfigEditor } from "./ConfigEditor";
import styled from "styled-components";
import { ButtonsHolder } from "../../../styles";

const Container = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
`;

export const ConfigDisplay = () => {
  const config = useRobotConfig();
  const setConfig = useSetRobotConfig();
  const [configNames, setConfigNames] = useState<string[]>([]);

  if (!config) {
    return null;
  }

  useEffect(() => {
    const getConfigs = async () => {
      const configs = await getAllConfigNames();
      setConfigNames(configs);
    };
    getConfigs();
  }, []);

  const selectExistingConfig = async (name: string) => {
    await selectConfig(name);
    const newConfig = await getCurrentRobotConfig();
    setConfig(newConfig);
  };

  return (
    <Container>
      <ConfigEditor initConfig={config} />
      <details>
        <summary>View JSON</summary>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </details>

      <ButtonsHolder>
        <button
          onClick={() => {
            // TODO, include "are you sure" prompt
          }}
        >
          Delete config
        </button>
      </ButtonsHolder>

      <div>
        <h2>Switch to:</h2>
        <ButtonsHolder>
          {configNames.map((name) => (
            <button key={name} onClick={() => selectExistingConfig(name)}>
              {name}
            </button>
          ))}
        </ButtonsHolder>
      </div>
    </Container>
  );
};
