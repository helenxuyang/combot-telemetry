import styled from "styled-components";
import {
  Container,
  MEDIUM_VIEWPORT,
  PLOT_BASE_COLOR,
  SMALL_VIEWPORT,
  Value,
} from "../../../styles";
import {
  getColor,
  getClampedPercent,
  getLatestValueDisplay,
} from "../../../dataUtils";
import { CanvasBar } from "./CanvasBar";
import { ColorIndicator } from "../../configuration/configUtils";

type Orientation = "vertical" | "horizontal";

type Props = {
  name: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  value: number;
  unit: string;
  min: number;
  max: number;
  colorIndicators: ColorIndicator[];
  className?: string;
  orientation?: Orientation;
  valueMinCharacters?: number;
  defaultColor?: string;
};

const StyledContainer = styled(Container)<{
  $orientation: Orientation;
}>`
  height: 100%;

  @media (max-width: ${SMALL_VIEWPORT}px) {
    width: ${({ $orientation }) =>
      $orientation === "horizontal" ? "100%" : "auto"};
  }
`;

const BarDisplayWrapper = styled.div<{
  $orientation: Orientation;
}>`
  display: flex;
  flex: ${({ $orientation }) => ($orientation === "vertical" ? 1 : "none")};
  flex-direction: ${({ $orientation }) =>
    $orientation === "vertical" ? "column" : "row-reverse"};
  align-items: center;
  justify-content: center;
`;

const BarHolder = styled.div`
  position: relative;
  display: flex;
  background-color: ${PLOT_BASE_COLOR};
  margin: 4px;
`;

const VerticalBarHolder = styled(BarHolder)`
  align-items: flex-end;
  height: 100%;
  width: 30px;
  min-height: 100px;
`;

const HorizontalBarHolder = styled(BarHolder)`
  align-items: center;
  height: 25px;
  width: 100%;
`;

const RangeText = styled.p`
  font-size: 12px;
`;

export const BarDisplay = ({
  name,
  headingLevel = 4,
  value,
  unit,
  min,
  max,
  colorIndicators,
  className = "",
  orientation = "vertical",
  valueMinCharacters,
  defaultColor,
}: Props) => {
  const percent = getClampedPercent(value, min, max);
  const barColor = getColor(value, colorIndicators, defaultColor);

  const Heading = `h${headingLevel}` as const;
  const BarHolderComponent =
    orientation === "vertical" ? VerticalBarHolder : HorizontalBarHolder;

  return (
    <StyledContainer $orientation={orientation} className={className}>
      <Heading>{name}</Heading>
      <BarDisplayWrapper $orientation={orientation}>
        <RangeText>{max}</RangeText>
        <BarHolderComponent>
          <CanvasBar
            percent={percent}
            color={barColor}
            orientation={orientation}
          />
        </BarHolderComponent>
        <RangeText>{min}</RangeText>
      </BarDisplayWrapper>
      <Value $valueMinCharacters={valueMinCharacters}>
        {getLatestValueDisplay(value, unit, min, max)}
      </Value>
    </StyledContainer>
  );
};
