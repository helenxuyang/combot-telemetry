import styled from "styled-components";
import { getSeriesColor } from "./features/graph/graphUtils";
import { ERROR, EscId, MeasurementName } from "./robot";

type Props = {
  name: MeasurementName | typeof ERROR;
  escId: EscId;
  isSelected: boolean;
  onClick: () => void;
};

const StyledPill = styled.button<{ $isSelected: boolean; $color?: string }>`
  border: 2px solid ${({ $color }) => $color};
  padding: 4px;
  font-size: 12px;
  background-color: ${({ $isSelected, $color }) => {
    return $isSelected ? $color : "white";
  }};
  color: ${({ $isSelected, $color }) => {
    return $isSelected ? "white" : $color;
  }};

  &:hover {
    border: 2px solid ${({ $color }) => $color};
    background-color: ${({ $isSelected, $color }) => {
      return $isSelected ? $color : "white";
    }};
    text-decoration: underline;
  }
`;

export const PlotPill = ({ name, escId, isSelected, onClick }: Props) => {
  const color = getSeriesColor(name, escId);
  return (
    <StyledPill onClick={onClick} $isSelected={isSelected} $color={color}>
      {name}
    </StyledPill>
  );
};
