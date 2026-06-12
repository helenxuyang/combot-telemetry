import styled from "styled-components";
import { type Measurement } from "./robot";
import { Container, Value } from "./styles";
import { getColor, getLatestPercent, getLatestValueDisplay } from "./dataUtils";
import { CanvasBar } from "./CanvasBar";

type Props = {
  measurement: Measurement;
  barColor?: string;
  className?: string;
  orientation?: "vertical" | "horizontal";
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
  margin: 8px;
`;

const RangeText = styled.p`
  font-size: 12px;
`;

export const BarDisplay = ({
  measurement,
  className = "",
  orientation = "vertical",
}: Props) => {
  const { name, min, max } = measurement;
  const percent = getLatestPercent(measurement);
  const barColor = getColor(measurement);

  return (
    <div className={className}>
      <Container>
        <h4>{name}</h4>
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
        <Value>{getLatestValueDisplay(measurement)}</Value>
      </Container>
    </div>
  );
};
