import styled from "styled-components";
import { SMALL_VIEWPORT } from "../../../styles";

type Editable = { $isEditable: boolean };

export const TextInput = styled.input<Editable>`
  ${(props) => !props.$isEditable && "pointer-events: none;"};
`;

export const CheckboxInput = styled.input<Editable>`
  ${(props) => !props.$isEditable && "pointer-events: none;"};
`;

export const NumberInput = styled.input<Editable>`
  max-width: 80px;
  ${(props) => !props.$isEditable && "pointer-events: none;"};

  @media (max-width: ${SMALL_VIEWPORT}px) {
    max-width: 40px;
  }
`;

export const RadioHolder = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
    align-items: start;
  }
`;

export const RadioInput = styled.input<Editable>`
  ${(props) => !props.$isEditable && "pointer-events: none;"};
  :disabled {
    color: #ccc;
  }
`;

export const RadioLabel = styled.label<{ $disabled: boolean }>`
  ${(props) => props.$disabled && "color: #ccc;"}
`;

export const ColorInput = styled.input`
  border: none;
  width: 32px;
  height: 20px;
  &::-webkit-color-swatch-wrapper {
    padding: 0px;
  }
`;
