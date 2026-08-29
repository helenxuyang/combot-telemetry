import styled, { css } from "styled-components";
import { media } from "../../../styles";

type Editable = { $isEditable: boolean };

const noPointerStyle = css`
  pointer-events: none;
`;

const uneditableStyle = css`
  ${noPointerStyle}
  border: none;
  field-sizing: content;
`;

export const TextInput = styled.input<Editable>`
  ${(props) => !props.$isEditable && uneditableStyle};
`;

export const CheckboxInput = styled.input<Editable>`
  ${(props) => !props.$isEditable && noPointerStyle};
`;

export const NumberInput = styled.input<Editable>`
  max-width: 80px;
  ${(props) => !props.$isEditable && uneditableStyle};

  ${media.small} {
    max-width: 40px;
  }
`;

export const RadioHolder = styled.div`
  display: flex;
  gap: 8px;

  ${media.small} {
    flex-direction: column;
    align-items: start;
  }
`;

export const RadioInput = styled.input<Editable>`
  ${(props) => !props.$isEditable && noPointerStyle};
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
