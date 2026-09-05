import { confirm } from "@tauri-apps/plugin-dialog";
import type { Draft } from "immer";
import { useEffect } from "react";
import styled from "styled-components";
import { useImmer } from "use-immer";
import { ALL_ESC_IDs, EscId } from "../../../robot";
import { useStorageUtils } from "../../../storageUtils";

import { useIsEditing, useSetIsEditing } from "../../../configStore";
import {
  useRobotConfig,
  useSetRobot,
  useSetRobotConfig,
} from "../../../robotStore";
import { ButtonsHolder, media, SpacedRow } from "../../../styles";
import {
  EscConfig,
  getNewEscConfig,
  getNewRobotConfig,
  initRobotFromConfig,
  RobotConfig,
} from "../configUtils";
import { EscConfigEditor } from "./EscConfigEditor";
import { TextInput } from "./inputStyles";

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

  ${media.small} {
    flex-direction: column;
  }
`;

const EscConfigHolder = styled.div`
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 4px;
`;

type Props = {
  isNewConfig: boolean;
  onDelete: () => Promise<void>;
};

export const ConfigEditor = ({ isNewConfig, onDelete }: Props) => {
  const setRobot = useSetRobot();
  const config = useRobotConfig();
  const setRobotConfig = useSetRobotConfig();
  const { saveConfig, selectConfig, deleteCurrentConfig } = useStorageUtils();

  const [configInput, setConfigInput] = useImmer<RobotConfig>(
    config ?? getNewRobotConfig(),
  );
  const isEditing = useIsEditing();
  const setIsEditing = useSetIsEditing();

  const usedEscIds = Object.keys(configInput.escConfigs) as EscId[];
  const canAddEsc = ALL_ESC_IDs.length !== usedEscIds.length;

  useEffect(() => {
    setConfigInput(
      isNewConfig ? getNewRobotConfig() : (config ?? getNewRobotConfig()),
    );
  }, [isNewConfig]);

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
    setIsEditing(true);
  };

  const discardEdits = async () => {
    // TODO: only show confirmation when there are actually unsaved edits
    const isSure = await confirm(
      "Are you sure you want to discard unsaved edits?",
    );
    if (isSure) {
      setIsEditing(false);
      if (config) {
        setConfigInput(config);
      }
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

  const handleDelete = async () => {
    if (!config) {
      return;
    }
    const isSure = await confirm(
      `Are you sure you want to delete ${config.name}?`,
    );
    if (isSure) {
      await deleteCurrentConfig();
      await onDelete();
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
            <button onClick={handleDelete}>Delete</button>
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
              <EscConfigHolder key={escId}>
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
