import styled from "styled-components";
import { useRobot } from "../../../store";

const barWidth = 6;
const svgSize = 50;

const DisplayHolder = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const getBars = (thresholds: number[]) => {
  const numBars = thresholds.length;

  return thresholds.map((threshold, i) => {
    const centerX = (svgSize / (numBars + 1)) * (i + 1);
    const x = centerX - barWidth / 2;
    const height = ((svgSize * 0.75) / numBars) * (i + 1);
    const y = svgSize - height;
    return { x, y, width: barWidth, height, threshold };
  });
};

export const SignalStrengthDisplay = () => {
  const robot = useRobot();
  const bars = getBars([-20, -10, -5, 0]);
  const signalStrength = robot?.signalStrengths
    .map((signalStrength) => signalStrength.value)
    .at(-1);

  return (
    <DisplayHolder>
      <svg
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        width={svgSize}
        height={svgSize}
      >
        <text x={5} y={svgSize / 2}>
          {signalStrength === undefined ? "0" : signalStrength}
        </text>
        {bars.map((bar) => (
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={
              signalStrength !== undefined && signalStrength >= bar.threshold
                ? "cornflowerblue"
                : "#ddd"
            }
            rx={0}
            ry={0}
          />
        ))}
      </svg>
    </DisplayHolder>
  );
};
