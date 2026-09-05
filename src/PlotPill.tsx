import { getSeriesColor } from "./features/graph/graphUtils";
import { ERROR, EscId, MeasurementName } from "./robot";
import { StyledPill } from "./styles";

type Props = {
  name: MeasurementName | typeof ERROR;
  escId: EscId;
  isSelected: boolean;
  onClick: () => void;
};

export const PlotPill = ({ name, escId, isSelected, onClick }: Props) => {
  const color = getSeriesColor(name, escId);
  return (
    <StyledPill onClick={onClick} $isSelected={isSelected} $color={color}>
      {name}
    </StyledPill>
  );
};
