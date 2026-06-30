import styled from "styled-components";
import { ColorIndicator } from "../../../robot";
import { Container, Value } from "../../../styles";
import {
  getColor,
  getLatestPercent,
  getLatestValueDisplay,
} from "../../../dataUtils";
import { CanvasBar } from "./CanvasBar";

type Props = {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  colorIndicators: ColorIndicator[];
  className?: string;
  orientation?: "vertical" | "horizontal";
};

const Label = styled.h4`
  text-wrap: wrap;
`;

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
  margin: 8px;
`;

const RangeText = styled.p`
  font-size: 12px;
`;

export const BarDisplay = ({
  name,
  value,
  unit,
  min,
  max,
  colorIndicators,
  className = "",
  orientation = "vertical",
}: Props) => {
  const percent = getLatestPercent(value, min, max);
  const barColor = getColor(value, colorIndicators);

  return (
    <div className={className}>
      <Container>
        <Label>{name}</Label>
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
        <Value>{getLatestValueDisplay(value, unit, min, max)}</Value>
      </Container>
    </div>
  );
};
