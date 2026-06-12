import styled from "styled-components";
import { type Measurement } from "./robot";
import { getClampedPercent } from "./dataUtils";

const ChartHolder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  font-size: 8px;
  margin: 4px;
  max-width: 100%;
`;

type Props = { measurement: Measurement };
export const LineChart = ({ measurement }: Props) => {
  const { values, min, max } = measurement;
  const rangeValues = values.slice(-100);
  const rangeMin = Math.min(...rangeValues);
  const rangeMax = Math.max(...rangeValues);

  const plotMin = Math.min(min, rangeMin);
  const plotMax = Math.max(max, rangeMax);
  const plotWidth = 100;
  const plotHeight = 30;

  const points = rangeValues
    .map((value, index) => {
      const percent = getClampedPercent(value, plotMin, plotMax);
      const remappedValue = (percent / 100) * plotHeight;
      const x = index;
      const y = plotHeight - remappedValue;
      return `${x},${y}`;
    })
    .join("\n");

  return (
    <ChartHolder>
      <p>{plotMax}</p>
      <svg viewBox={`0 0 100 ${plotHeight}`}>
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={plotHeight}
          strokeWidth={2}
          stroke="white"
        />
        <line
          x1={0}
          y1={plotHeight}
          x2={plotWidth}
          y2={plotHeight}
          strokeWidth={2}
          stroke="white"
        />
        <polyline fill="none" stroke="white" strokeWidth={2} points={points} />
      </svg>
      <p>{plotMin}</p>
    </ChartHolder>
  );
};
