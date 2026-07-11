import { useEffect, useState } from "react";
import {
  useIsEditing,
  useRobot,
  useRobotConfig,
  useSetIsEditing,
  useSetRobot,
  useSetRobotConfig,
} from "../../../store";
import { ConfigEditor } from "./ConfigEditor";
import styled from "styled-components";
import { ButtonsHolder } from "../../../styles";
import { confirm } from "@tauri-apps/plugin-dialog";
import {
  deleteCurrentConfig,
  getAllConfigNames,
  getConfig,
  selectConfig,
} from "../../../storageUtils";
import { initRobotFromConfig } from "../configUtils";

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
  const robot = useRobot();
  const setRobot = useSetRobot();
  const isEditing = useIsEditing();
  const setIsEditing = useSetIsEditing();

  const [configNames, setConfigNames] = useState<string[]>([]);

  useEffect(() => {
    getConfigs();
  }, [config]);

  const getConfigs = async () => {
    const configs = await getAllConfigNames();
    setConfigNames(configs);
  };

  const selectExistingConfig = async (name: string) => {
    await selectConfig(name);
    const config = await getConfig(name);
    setConfig(config);
    if (config && !robot) {
      setRobot(initRobotFromConfig(config));
    }
    // TODO: tell Rust to update
  };

  const startCreating = async () => {
    setIsEditing(true);
  };

  return (
    <Container>
      {(config || isEditing) && (
        <>
          <ConfigEditor initConfig={config} />
          <details>
            <summary>View JSON</summary>
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </details>
        </>
      )}

      <button onClick={startCreating}>New</button>

      <div>
        <h2>All configs</h2>
        <ButtonsHolder>
          {configNames.length ? (
            <ButtonsHolder>
              {configNames.map((name) => (
                <button
                  key={name}
                  onClick={async () => await selectExistingConfig(name)}
                >
                  {name}
                </button>
              ))}
            </ButtonsHolder>
          ) : (
            "None"
          )}
        </ButtonsHolder>
      </div>
    </Container>
  );
};
