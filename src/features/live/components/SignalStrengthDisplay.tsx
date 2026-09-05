import styled from "styled-components";
import { useRobot } from "../../../robotStore";
import { Value } from "../../../styles";

const barWidth = 6;
const svgSize = 50;

const DisplayHolder = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SignalSvg = styled.svg`
  flex: 1;
  min-width: 0;
  min-height: 40px;
  width: 100%;
  height: 100%;
  max-width: 120px;
`;

const getBars = (thresholds: number[]) => {
  const numBars = thresholds.length;

  return thresholds.map((threshold, i) => {
    const centerX = (svgSize / (numBars + 1)) * (i + 1);
    const x = centerX - barWidth / 2;
    const height = ((svgSize * 0.75) / numBars) * (i + 1);
    const y = svgSize - height - svgSize * 0.1;
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
      <Value>
        {"SNR: " + (signalStrength === undefined ? "0" : signalStrength)}
      </Value>
      <SignalSvg
        overflow="hidden"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {bars.map((bar) => (
          <rect
            key={bar.threshold}
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
      </SignalSvg>
    </DisplayHolder>
  );
};
