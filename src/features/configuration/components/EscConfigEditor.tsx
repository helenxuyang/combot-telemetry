import styled from "styled-components";
import { ALL_ESC_IDs, EscId, MeasurementName } from "../../../robot";
import { MeasurementConfig, MotorConfig } from "../configUtils";
import { EscConfig } from "../configUtils";
import { MeasurementConfigEditor } from "./MeasurementConfigEditor";
import { RadioHolder, RadioInput, RadioLabel, TextInput } from "./inputStyles";
import { SMALL_VIEWPORT, SpacedRow, Table } from "../../../styles";
import { Draft } from "immer";
import { MotorConfigEditor } from "./MotorConfigEditor";
import { useIsEditing } from "../../../store";

type Props = {
  escId: EscId;
  config: EscConfig;
  updateConfig: (
    updater: (config: Draft<EscConfig> | undefined) => void,
  ) => void;
  updateConfigId: (newId: EscId, config: EscConfig) => void;
  usedEscIds: EscId[];
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

export const EscConfigEditor = ({
  escId,
  config,
  updateConfig,
  updateConfigId,
  usedEscIds,
}: Props) => {
  const isEditing = useIsEditing();

  const updateMotorConfig = (
    updater: (motorConfig: Draft<MotorConfig> | undefined) => void,
  ) =>
    updateConfig((config) => {
      if (config) {
        updater(config.motorConfig);
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
      <Table>
        <thead>
          <tr>
            <th>Measurement</th>
            {isEditing ? <th>Show</th> : null}
            <th>Min</th>
            <th>Max</th>
            <th>Colors</th>
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

            return isEditing || measurementConfig.shouldShow ? (
              <MeasurementConfigEditor
                key={measurementName}
                name={measurementName}
                config={measurementConfig}
                updateConfig={getMeasurementConfigUpdater(measurementName)}
                escId={escId}
              />
            ) : null;
          })}
        </tbody>
      </Table>
      <MotorConfigEditor
        config={config.motorConfig}
        updateConfig={updateMotorConfig}
        escId={escId}
      />
    </Container>
  );
};
