import {
  EscConfig,
  getNewEscConfig,
  getNewRobotConfig,
  initRobotFromConfig,
  RobotConfig,
} from "../configUtils";
import { ALL_ESC_IDs, EscId } from "../../../robot";
import { useImmer } from "use-immer";
import {
  useIsEditing,
  useRobot,
  useRobotConfig,
  useSetIsEditing,
  useSetRobot,
  useSetRobotConfig,
} from "../../../store";
import styled from "styled-components";
import { EscConfigEditor } from "./EscConfigEditor";
import { useEffect, useState } from "react";
import { ButtonsHolder, SMALL_VIEWPORT, SpacedRow } from "../../../styles";
import type { Draft } from "immer";
import { TextInput } from "./inputStyles";
import { confirm } from "@tauri-apps/plugin-dialog";
import {
  deleteCurrentConfig,
  saveConfig,
  selectConfig,
} from "../../../storageUtils";

type Props = {
  initConfig: RobotConfig | null;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
`;

const EscContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const EscConfigHolder = styled.div`
  border: 1px solid black;
  padding: 4px;
`;

export const ConfigEditor = ({ initConfig }: Props) => {
  const [configInput, setConfigInput] = useImmer<RobotConfig>(
    initConfig ?? getNewRobotConfig(),
  );
  const [preEditsConfig, setPreEditsConfig] =
    useState<RobotConfig>(configInput);
  const isEditing = useIsEditing();
  const setIsEditing = useSetIsEditing();

  const robot = useRobot();
  const setRobot = useSetRobot();
  const config = useRobotConfig();
  const setRobotConfig = useSetRobotConfig();
  const usedEscIds = Object.keys(configInput.escConfigs) as EscId[];
  const canAddEsc = ALL_ESC_IDs.length !== usedEscIds.length;

  // TODO: handle switching configs while editing - maybe show are you sure dialog
  // might be better to pull configInput and isEditing state up to Display or to store
  useEffect(() => {
    if (!isEditing && config) {
      setConfigInput(config);
    }
  }, [config]);

  const getFirstUnusedId = (): EscId | null => {
    const availableEscIds = ALL_ESC_IDs.filter(
      (id) => !usedEscIds.includes(id),
    );
    if (availableEscIds.length > 0) {
      return availableEscIds[0];
    } else {
      return null;
    }
  };

  const addNewEsc = () => {
    const firstUnusedId = getFirstUnusedId();
    if (firstUnusedId) {
      setConfigInput((config) => {
        config.escConfigs[firstUnusedId] = getNewEscConfig();
      });
    }
  };

  const duplicateEsc = async (esc: EscConfig) => {
    const firstUnusedId = getFirstUnusedId();
    if (firstUnusedId) {
      setConfigInput((config) => {
        config.escConfigs[firstUnusedId] = structuredClone(esc);
      });
    }
  };

  const deleteEsc = async (escId: EscId) => {
    setConfigInput((config) => {
      delete config.escConfigs[escId];
    });
  };

  const startEditing = async () => {
    setPreEditsConfig(structuredClone(configInput));
    setIsEditing(true);
  };

  const discardEdits = async () => {
    // TODO: only show confirmation when there are actually unsaved edits
    const isSure = await confirm(
      "Are you sure you want to discard unsaved edits?",
    );
    if (isSure) {
      setIsEditing(false);
      setConfigInput(preEditsConfig);
    }
  };

  const saveEdits = async () => {
    // TODO: error validation for unique name, at least 1 esc, no duplicates, etc.
    await saveConfig(configInput);
    await selectConfig(configInput.name);
    setRobotConfig(configInput);
    setIsEditing(false);
    setRobot(initRobotFromConfig(configInput));
  };

  const deleteConfig = async () => {
    if (!config) {
      return;
    }
    const isSure = await confirm(
      `Are you sure you want to delete ${config.name}?`,
    );
    if (isSure) {
      await deleteCurrentConfig();
      setRobotConfig(null);
      setRobotConfig(null);
      setPreEditsConfig(getNewRobotConfig());
      setConfigInput(getNewRobotConfig());
    }
  };

  return (
    <Container>
      <SpacedRow>
        <div>
          <h2>Robot Name</h2>
          <TextInput
            value={configInput.name}
            type="text"
            id="name"
            name="name"
            required
            autoComplete="false"
            minLength={1}
            readOnly={!isEditing}
            $isEditable={isEditing}
            onChange={(e) => {
              setConfigInput((config) => {
                config.name = e.target.value;
              });
            }}
          />
        </div>

        {!isEditing && (
          <ButtonsHolder>
            <button onClick={startEditing}>Edit</button>
            <button onClick={deleteConfig}>Delete</button>
          </ButtonsHolder>
        )}
      </SpacedRow>
      <h2>ESCs</h2>
      <EscContainer>
        {(Object.entries(configInput.escConfigs) as [EscId, EscConfig][]).map(
          ([escId, escConfig]) => {
            const updateEscConfig = (
              updater: (escConfig: Draft<EscConfig> | undefined) => void,
            ) => {
              setConfigInput((config) => {
                updater(config.escConfigs[escId]);
              });
            };

            const updateConfigId = async (
              newId: EscId,
              escConfig: EscConfig,
            ) => {
              setConfigInput((config) => {
                delete config.escConfigs[escId];
                config.escConfigs[newId] = escConfig;
                // keep IDs sorted alphabetically
                config.escConfigs = Object.fromEntries(
                  Object.entries(config.escConfigs).sort(([a], [b]) =>
                    a.localeCompare(b),
                  ),
                );
              });
            };

            return (
              <EscConfigHolder>
                <EscConfigEditor
                  key={escId}
                  escId={escId}
                  config={escConfig}
                  updateConfig={updateEscConfig}
                  updateConfigId={updateConfigId}
                  usedEscIds={Object.keys(configInput.escConfigs) as EscId[]}
                />
                {isEditing && (
                  <ButtonsHolder>
                    {canAddEsc && (
                      <button onClick={() => duplicateEsc(escConfig)}>
                        Duplicate
                      </button>
                    )}
                    <button onClick={() => deleteEsc(escId)}>Delete</button>
                  </ButtonsHolder>
                )}
              </EscConfigHolder>
            );
          },
        )}
      </EscContainer>

      {isEditing && (
        <div>
          {canAddEsc && <button onClick={addNewEsc}>Add ESC</button>}
          <ButtonsHolder>
            <button onClick={discardEdits}>Discard edits</button>
            <button onClick={saveEdits}>Save edits</button>
          </ButtonsHolder>
        </div>
      )}
    </Container>
  );
};
