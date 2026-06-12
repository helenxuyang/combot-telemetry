import styled from "styled-components";
import { pulseAnimation } from "./styles";

const StyledDot = styled.span`
  ${pulseAnimation()}
`;

type Props = {
  dot?: string;
};
export const StatusDot = ({ dot = "🔴" }: Props) => {
  return <StyledDot>{dot}</StyledDot>;
};
