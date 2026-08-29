import styled from "styled-components";
import {
  RadioHolder,
  NumberInput,
  ColorInput,
  RadioInput,
} from "./inputStyles";
import { CondensedButton, media } from "../../../styles";
import { Draft } from "immer";
import { ColorIndicator } from "../configUtils";

const Container = styled.div`
  display: flex;
  gap: 4px;
  margin: 2px;
  ${media.medium} {
    flex-direction: column;
    align-items: start;
  }
`;

type Props = {
  id: string;
  colorIndicator: ColorIndicator;
  updateColorIndicator: (
    updater: (colorIndicator: Draft<ColorIndicator> | undefined) => void,
  ) => void;
  deleteColorIndicator: () => void;
  isEditing: boolean;
};

export const ColorIndicatorEditor = ({
  id,
  colorIndicator,
  updateColorIndicator,
  deleteColorIndicator,
  isEditing,
}: Props) => {
  const aboveId = `${id}-above`;
  const belowId = `${id}-below`;
  const thresholdId = `${id}-threshold`;
  const colorId = `${id}-color`;

  return (
    <Container>
      {!isEditing ? (
        <p>{colorIndicator.condition === "above" ? "≥" : "≤"}</p>
      ) : (
        <RadioHolder>
          <RadioInput
            value="above"
            type="radio"
            id={aboveId}
            name={aboveId}
            checked={colorIndicator.condition === "above"}
            $isEditable={isEditing}
            onChange={(e) => {
              updateColorIndicator((colorIndicator) => {
                if (!colorIndicator) return;
                colorIndicator.condition = e.target
                  .value as ColorIndicator["condition"];
              });
            }}
          />
          <label htmlFor={aboveId}>above</label>
          <RadioInput
            value="below"
            type="radio"
            id={belowId}
            name={belowId}
            checked={colorIndicator.condition === "below"}
            $isEditable={isEditing}
            onChange={(e) => {
              updateColorIndicator((colorIndicator) => {
                if (!colorIndicator) return;
                colorIndicator.condition = e.target
                  .value as ColorIndicator["condition"];
              });
            }}
          />
          <label htmlFor={belowId}>below</label>
        </RadioHolder>
      )}
      <NumberInput
        value={colorIndicator.threshold}
        type="number"
        id={thresholdId}
        name={thresholdId}
        readOnly={!isEditing}
        $isEditable={isEditing}
        onChange={(e) => {
          updateColorIndicator((colorIndicator) => {
            if (!colorIndicator) return;
            colorIndicator.threshold = Number(e.target.value);
          });
        }}
      />
      <ColorInput
        value={colorIndicator.color}
        type="color"
        id={colorId}
        name={colorId}
        disabled={!isEditing}
        onChange={(e) => {
          updateColorIndicator((colorIndicator) => {
            if (!colorIndicator) return;
            colorIndicator.color = e.target.value;
          });
        }}
      />

      <br />
      {isEditing && (
        <CondensedButton onClick={deleteColorIndicator}>Delete</CondensedButton>
      )}
    </Container>
  );
};
