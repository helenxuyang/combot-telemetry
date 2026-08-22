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
import {
  baseDir,
  getAllConfigNames,
  getCurrentConfig,
  useStorageUtils,
} from "../../../storageUtils";
import { initRobotFromConfig, RobotConfig } from "../configUtils";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

const Container = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
`;

export const ButtonsHolder = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
`;

export const ConfigDisplay = () => {
  const config = useRobotConfig();
  const setRobot = useSetRobot();
  const isEditing = useIsEditing();
  const setIsEditing = useSetIsEditing();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [configNames, setConfigNames] = useState<string[]>([]);
  const { selectConfig, importConfig } = useStorageUtils();

  useEffect(() => {
    getConfigs();
  }, [config]);

  useEffect(() => {
    // TODO: handle this better to avoid losing unsaved edits
    return () => {
      setIsCreating(false);
      setIsEditing(false);
    };
  }, []);

  const getConfigs = async () => {
    const configs = await getAllConfigNames();
    setConfigNames(configs);
  };

  const selectExistingConfig = async (name: string) => {
    await selectConfig(name);
    const currentConfig = await getCurrentConfig();
    if (currentConfig) {
      setRobot(initRobotFromConfig(currentConfig));
    }
  };

  const handleCreateNew = async () => {
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleImport = async () => {
    const selectedPath = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Robot configurations",
          extensions: ["json"],
        },
      ],
    });

    if (selectedPath) {
      const fileContents = await readTextFile(selectedPath, {
        baseDir,
      });
      const config: RobotConfig = JSON.parse(fileContents);
      await importConfig(config);
    }
  };

  return (
    <Container>
      {(config || isCreating) && (
        <>
          <ConfigEditor
            isNewConfig={isCreating}
            onDelete={async () => {
              setIsEditing(false);
              setIsCreating(false);
              await getConfigs();
            }}
          />
          <details>
            <summary>View JSON</summary>
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </details>
        </>
      )}

      {!isEditing && (
        <div>
          <h2>All configs</h2>
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
          <h2>Create new config</h2>
          <ButtonsHolder>
            <button onClick={handleCreateNew}>New</button>
            <button onClick={handleImport}>Import JSON</button>
          </ButtonsHolder>
        </div>
      )}
    </Container>
  );
};
