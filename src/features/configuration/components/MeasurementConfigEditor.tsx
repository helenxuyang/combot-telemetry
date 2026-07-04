import { ColorIndicatorEditor } from "./ColorIndicatorEditor";
import { getNewColorIndicator } from "../configUtils";
import { EscId, ColorIndicator, MeasurementOrInput } from "../../../robot";
import { MeasurementConfig } from "../configUtils";
import { METADATA } from "../../../displayUtils";
import { CheckboxInput, NumberInput } from "./inputStyles";
import { CondensedButton } from "../../../styles";
import { Draft } from "immer";
import styled from "styled-components";

const AddButton = styled(CondensedButton)`
  display: block;
  margin-top: 4px;
`;

type Props = {
  name: MeasurementOrInput;
  config: MeasurementConfig;
  updateConfig: (
    updater: (config: Draft<MeasurementConfig> | undefined) => void,
  ) => void;
  escId: EscId;
  isEditing: boolean;
};

export const MeasurementConfigEditor = ({
  name,
  config,
  updateConfig,
  escId,
  isEditing,
}: Props) => {
  const measurementId = `esc-${escId}-${name}`;
  const minInputId = `${measurementId}-min`;
  const maxInputId = `${measurementId}-max`;
  const showInputId = `${measurementId}-show`;
  const colorIndicatorsId = `${measurementId}-color-indicators`;

  const addColorIndicator = () => {
    updateConfig(
      (config) => config && config.colorIndicators.push(getNewColorIndicator()),
    );
  };
  const unit = METADATA[name].unit;

  return (
    <tr key={name}>
      <td>
        {METADATA[name].displayName} {unit && `(${METADATA[name].unit})`}
      </td>
      {isEditing ? (
        <td>
          <CheckboxInput
            checked={config.shouldShow}
            type="checkbox"
            id={showInputId}
            $isEditable={isEditing}
            onChange={(e) => {
              if (isEditing) {
                updateConfig((config) => {
                  if (config) {
                    config.shouldShow = e.target.checked;
                  }
                });
              }
            }}
          />
        </td>
      ) : null}
      <td>
        <NumberInput
          value={config.min}
          type="number"
          id={minInputId}
          name={minInputId}
          required
          readOnly={!isEditing}
          $isEditable={isEditing}
          onChange={(e) => {
            updateConfig((config) => {
              if (config) {
                config.min = Number(e.target.value);
              }
            });
          }}
        />
      </td>
      <td>
        <NumberInput
          value={config.max}
          type="number"
          id={maxInputId}
          name={maxInputId}
          required
          readOnly={!isEditing}
          $isEditable={isEditing}
          onChange={(e) => {
            updateConfig((config) => {
              if (config) {
                config.max = Number(e.target.value);
              }
            });
          }}
        />
      </td>
      <td>
        {config.colorIndicators.length === 0
          ? "None"
          : config.colorIndicators.map((indicator, index) => {
              const colorIndicatorId = `${colorIndicatorsId}-${index}`;

              const updateColorIndicator = (
                updater: (
                  colorIndicator: Draft<ColorIndicator> | undefined,
                ) => void,
              ) => {
                updateConfig((config) => {
                  if (!config) return;
                  updater(config.colorIndicators[index]);
                });
              };

              const deleteColorIndicator = () => {
                updateConfig(
                  (config) => config && config.colorIndicators.splice(index, 1),
                );
              };

              return (
                <ColorIndicatorEditor
                  key={colorIndicatorId} // TODO: avoid using index
                  id={colorIndicatorId}
                  colorIndicator={indicator}
                  updateColorIndicator={updateColorIndicator}
                  deleteColorIndicator={deleteColorIndicator}
                  isEditing={isEditing}
                />
              );
            })}
        {isEditing && (
          <AddButton onClick={addColorIndicator} aria-label="Add new color">
            + Add
          </AddButton>
        )}
      </td>
    </tr>
  );
};
