import styled from "styled-components";
import { Container } from "../../../styles";

type Props = {
  signalStrength: number | undefined;
};

const StyledValue = styled.p`
  font-size: 16px;
  font-weight: bold;
`;

const StyledSvg = styled.svg`
  margin: 8px;
`;

const barWidth = 14;
const svgSize = 100;

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

export const SignalStrengthDisplay = ({ signalStrength }: Props) => {
  const bars = getBars([-20, -10, -5, 0]);
  return (
    <Container>
      <h3>Signal Strength</h3>
      <StyledSvg
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        width={svgSize}
      >
        {bars.map((bar) => (
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={
              signalStrength !== undefined && signalStrength >= bar.threshold
                ? "cornflowerblue"
                : "white"
            }
            rx={0}
            ry={0}
          />
        ))}
      </StyledSvg>
      <StyledValue>
        {"SNR: " + (signalStrength === undefined ? "none" : signalStrength)}
      </StyledValue>
    </Container>
  );
};
