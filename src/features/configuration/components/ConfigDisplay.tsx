import { useEffect, useState } from "react";
import {
  deleteConfig,
  getAllConfigNames,
  getCurrentRobotConfig,
  selectConfig,
} from "../configUtils";
import { useRobotConfig, useSetRobotConfig } from "../../../store";
import { ConfigEditor } from "./ConfigEditor";
import styled from "styled-components";
import { ButtonsHolder } from "../../../styles";
import { confirm } from "@tauri-apps/plugin-dialog";

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

      {/* <ButtonsHolder>
        <button
          onClick={async () => {
            const isSure = await confirm(
              `Are you sure you want to delete ${config.name}?`,
            );
            if (isSure) {
              await deleteConfig(config);
            }
          }}
        >
          Delete {config.name}
        </button>
      </ButtonsHolder> */}

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
