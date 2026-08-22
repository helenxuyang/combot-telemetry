import styled from "styled-components";
import { Container, Value } from "../../../styles";
import {
  getColor,
  getClampedPercent,
  getLatestValueDisplay,
} from "../../../dataUtils";
import { CanvasBar } from "./CanvasBar";
import { ColorIndicator } from "../../configuration/configUtils";

type Props = {
  name: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  value: number;
  unit: string;
  min: number;
  max: number;
  colorIndicators: ColorIndicator[];
  className?: string;
  orientation?: "vertical" | "horizontal";
  valueMinCharacters?: number;
};

const BarDisplayWrapper = styled.div<{
  $orientation: "vertical" | "horizontal";
}>`
  display: flex;
  flex-direction: ${({ $orientation }) =>
    $orientation === "vertical" ? "column" : "row"};
  align-items: center;
  justify-content: center;
`;

const BarHolder = styled.div<{ $orientation: "vertical" | "horizontal" }>`
  position: relative;
  display: flex;
  align-items: ${({ $orientation }) =>
    $orientation === "vertical" ? "flex-end" : "center"};
  height: ${({ $orientation }) =>
    $orientation === "vertical" ? "100px" : "25px"};
  width: ${({ $orientation }) =>
    $orientation === "vertical" ? "20px" : "100%"};
  min-height: ${({ $orientation }) =>
    $orientation === "vertical" ? "100px" : "auto"};
  min-width: ${({ $orientation }) =>
    $orientation === "vertical" ? "auto" : "100px"};
  background-color: white;
  margin: 4px;
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
}: Props) => {
  const percent = getClampedPercent(value, min, max);
  const barColor = getColor(value, colorIndicators);

  const Heading = `h${headingLevel}` as const;

  return (
    <Container className={className}>
      <Heading>{name}</Heading>
      <BarDisplayWrapper $orientation={orientation}>
        {orientation === "vertical" ? (
          <>
            <RangeText>{max}</RangeText>
            <BarHolder $orientation={orientation}>
              <CanvasBar
                percent={percent}
                color={barColor}
                orientation={orientation}
              />
            </BarHolder>
            <RangeText>{min}</RangeText>
          </>
        ) : (
          <>
            <RangeText>{min}</RangeText>
            <BarHolder $orientation={orientation}>
              <CanvasBar
                percent={percent}
                color={barColor}
                orientation={orientation}
              />
            </BarHolder>
            <RangeText>{max}</RangeText>
          </>
        )}
      </BarDisplayWrapper>
      <Value $valueMinCharacters={valueMinCharacters}>
        {getLatestValueDisplay(value, unit, min, max)}
      </Value>
    </Container>
  );
};
