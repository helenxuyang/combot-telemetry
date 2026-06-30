import {
  EscConfig,
  getNewEscConfig,
  getNewRobotConfig,
  RobotConfig,
  saveRobotConfig,
} from "../configUtils";
import { ALL_ESC_IDs, EscId } from "../../../robot";
import { useImmer } from "use-immer";
import { useSetRobotConfig } from "../../../store";
import styled from "styled-components";
import { EscConfigEditor } from "./EscConfigEditor";
import { useState } from "react";
import { ButtonsHolder, SMALL_VIEWPORT, SpacedRow } from "../../../styles";
import type { Draft } from "immer";
import { TextInput } from "./inputStyles";

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

export const ConfigEditor = ({ initConfig }: Props) => {
  const [config, setConfig] = useImmer<RobotConfig>(
    initConfig ?? getNewRobotConfig(),
  );
  const [preEditsConfig, setPreEditsConfig] = useState<RobotConfig>(config);
  const [isEditing, setIsEditing] = useState(false);

  const setRobotConfig = useSetRobotConfig();
  const usedEscIds = Object.keys(config.escConfigs) as EscId[];
  const canAddEsc = ALL_ESC_IDs.length !== usedEscIds.length;

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
      setConfig((config) => {
        config.escConfigs[firstUnusedId] = getNewEscConfig();
      });
    }
  };

  const duplicateEsc = async (esc: EscConfig) => {
    const firstUnusedId = getFirstUnusedId();
    if (firstUnusedId) {
      setConfig((config) => {
        config.escConfigs[firstUnusedId] = structuredClone(esc);
      });
    }
  };

  const startEditing = async () => {
    setPreEditsConfig(structuredClone(config));
    setIsEditing(true);
  };

  const discardEdits = async () => {
    setIsEditing(false);
    setConfig(preEditsConfig);
  };

  const saveEdits = async () => {
    // TODO: error validation for unique name, at least 1 esc, no duplicates, etc.
    await saveRobotConfig(config);
    setRobotConfig(config);
    setIsEditing(false);
  };

  return (
    <Container>
      <SpacedRow>
        <div>
          <h2>Robot Name</h2>
          <TextInput
            value={config.name}
            type="text"
            id="name"
            name="name"
            required
            autoComplete="false"
            minLength={1}
            readOnly={!isEditing}
            $isEditable={isEditing}
            onChange={(e) => {
              setConfig((config) => {
                config.name = e.target.value;
              });
            }}
          />
        </div>

        {!isEditing && <button onClick={startEditing}>Edit</button>}
      </SpacedRow>
      <h2>ESCs</h2>
      <EscContainer>
        {(Object.entries(config.escConfigs) as [EscId, EscConfig][]).map(
          ([escId, escConfig]) => {
            const updateEscConfig = (
              updater: (escConfig: Draft<EscConfig> | undefined) => void,
            ) => {
              setConfig((config) => {
                updater(config.escConfigs[escId]);
              });
            };

            const updateConfigId = async (
              newId: EscId,
              escConfig: EscConfig,
            ) => {
              setConfig((config) => {
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
              <EscConfigEditor
                key={escId}
                escId={escId}
                config={escConfig}
                updateConfig={updateEscConfig}
                updateConfigId={updateConfigId}
                usedEscIds={Object.keys(config.escConfigs) as EscId[]}
                isEditing={isEditing}
                duplicateEsc={() => duplicateEsc(escConfig)}
              />
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
