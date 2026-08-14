import styled from "styled-components";
import { Container } from "../../../styles";

type Props = {
  signalStrength: number;
};

const StyledValue = styled.p`
  font-size: 32px;
`;

export const SignalStrengthDisplay = ({ signalStrength }: Props) => {
  return (
    <Container>
      <h3>Signal Strength</h3>
      <StyledValue>{signalStrength}</StyledValue>
    </Container>
  );
};
