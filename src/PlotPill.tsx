import styled from "styled-components";
import { getSeriesColor } from "./features/graph/graphUtils";
import { ERROR, MeasurementName } from "./robot";

type Props = {
  name: MeasurementName | typeof ERROR;
  isSelected: boolean;
  onClick: () => void;
};

const StyledPill = styled.button<{ $isSelected: boolean; $color?: string }>`
  border-radius: 64px;
  padding: 4px;
  color: ${({ $color }) => $color};
  font-size: 12px;
  background-color: ${({ $isSelected }) => {
    return $isSelected ? "lightgreen" : "white";
  }};
`;

export const PlotPill = ({ name, isSelected, onClick }: Props) => {
  const color = getSeriesColor(name);
  return (
    <StyledPill onClick={onClick} $isSelected={isSelected} $color={color}>
      {name}
    </StyledPill>
  );
};
