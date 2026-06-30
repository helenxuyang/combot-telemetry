import styled from "styled-components";
import { ALL_ESC_IDs, EscId, INPUT, MeasurementName } from "../../../robot";
import { MeasurementConfig } from "../configUtils";
import { EscConfig } from "../configUtils";
import { MeasurementConfigEditor } from "./MeasurementConfigEditor";
import { RadioHolder, RadioInput, RadioLabel, TextInput } from "./inputStyles";
import { SMALL_VIEWPORT, SpacedRow } from "../../../styles";
import { Draft } from "immer";

type Props = {
  escId: EscId;
  config: EscConfig;
  updateConfig: (
    updater: (config: Draft<EscConfig> | undefined) => void,
  ) => void;
  updateConfigId: (newId: EscId, config: EscConfig) => void;
  usedEscIds: EscId[];
  isEditing: boolean;
  duplicateEsc: () => void;
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid black;
  padding: 8px;

  @media (max-width: ${SMALL_VIEWPORT}px) {
    align-items: start;
  }
`;

const IdSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  @media (max-width: ${SMALL_VIEWPORT}px) {
    align-items: start;
  }
`;

const MeasurementTable = styled.table`
  border: 1px solid black;
  border-collapse: collapse;
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
    padding: 4px;
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    width: 100%;
    tr {
      display: block;
      border-bottom: 1px solid black;
    }
    th,
    td {
      display: block;
      border: none;
      position: relative;
      text-align: left;
    }
  }
`;

export const EscConfigEditor = ({
  escId,
  config,
  updateConfig,
  updateConfigId,
  usedEscIds,
  isEditing,
  duplicateEsc,
}: Props) => {
  const updateInputsConfig = (
    updater: (measurementConfig: Draft<MeasurementConfig> | undefined) => void,
  ) =>
    updateConfig((config) => {
      if (config) {
        updater(config.inputsConfig);
      }
    });

  return (
    <Container key={escId}>
      <SpacedRow>
        <div>
          <h3>Name</h3>
          <TextInput
            value={config.name}
            type="text"
            id={`esc-${escId}-name`}
            name={`esc-${escId}-name`}
            required
            autoComplete="false"
            $isEditable={isEditing}
            onChange={(e) => {
              updateConfig((config) => {
                if (config) {
                  config.name = e.target.value;
                }
              });
            }}
          />
        </div>
        <IdSection>
          <h3>ID</h3>
          <RadioHolder>
            {isEditing ? (
              ALL_ESC_IDs.map((id) => {
                const radioId = `telemetry-id-${id}`;
                const isRadioDisabled = escId !== id && usedEscIds.includes(id);
                return (
                  <span key={radioId}>
                    <RadioInput
                      value={id}
                      type="radio"
                      id={radioId}
                      name={`esc-${id}`}
                      checked={escId === id}
                      disabled={isRadioDisabled}
                      $isEditable={isEditing}
                      onChange={(e) => {
                        const newId = e.target.value as EscId;
                        updateConfigId(newId, config);
                      }}
                    />
                    <RadioLabel htmlFor={radioId} $disabled={isRadioDisabled}>
                      {id}
                    </RadioLabel>
                  </span>
                );
              })
            ) : (
              <p>{escId}</p>
            )}
          </RadioHolder>
        </IdSection>
      </SpacedRow>
      <MeasurementTable>
        <thead>
          <tr>
            <th>Value</th>
            <th>Show</th>
            <th>Min</th>
            <th>Max</th>
            <th>Color Indicators</th>
          </tr>
        </thead>

        <tbody>
          {(
            Object.entries(config.measurementConfigs) as [
              MeasurementName,
              MeasurementConfig,
            ][]
          ).map(([measurementName, measurementConfig]) => {
            const getMeasurementConfigUpdater = (
              measurementName: MeasurementName,
            ) => {
              return (
                updater: (
                  measurementConfig: Draft<MeasurementConfig> | undefined,
                ) => void,
              ) =>
                updateConfig((config) => {
                  if (config) {
                    updater(config.measurementConfigs[measurementName]);
                  }
                });
            };

            return (
              <MeasurementConfigEditor
                key={measurementName}
                name={measurementName}
                config={measurementConfig}
                updateConfig={getMeasurementConfigUpdater(measurementName)}
                escId={escId}
                isEditing={isEditing}
              />
            );
          })}
          <MeasurementConfigEditor
            key={INPUT}
            name={INPUT}
            config={config.inputsConfig}
            updateConfig={updateInputsConfig}
            escId={escId}
            isEditing={isEditing}
          />
        </tbody>
      </MeasurementTable>
      <button onClick={duplicateEsc}>Duplicate</button>
    </Container>
  );
};
