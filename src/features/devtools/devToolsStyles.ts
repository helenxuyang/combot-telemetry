import styled from "styled-components";
import { Container, media } from "../../styles";

export const StyledContainer = styled(Container)`
  padding: 16px;
  gap: 16px;
  align-items: start;
`;

export const RawMessageInput = styled.input`
  width: 100%;
`;

export const EscSelection = styled.fieldset`
  text-align: start;

  legend {
    display: inline-block;
  }
`;

export const InputHolder = styled.div`
  display: flex;
  gap: 8px;

  input {
    width: 80px;
  }

  ${media.extraSmall} {
    flex-direction: column;
  }
`;
