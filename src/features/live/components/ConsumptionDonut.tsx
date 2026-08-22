import styled from "styled-components";
import { CONSUMPTION, ESC } from "../../../robot";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Container, ESC_COLORS } from "../../../styles";
import { calculateTotal, getLatestValue } from "../../../dataUtils";
import { useRobotConfig } from "../../../store";

const StyledContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 150px;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: auto;
  display: block;
`;

const TotalLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-weight: bold;
  pointer-events: none;
`;

const Label = styled.span`
  position: absolute;
  width: min-content;
  white-space: nowrap;
  font-size: 12px;
`;

type Props = {
  escs: ESC[];
};

const svgSize = 150;
const radius = svgSize / 3;

export const ConsumptionDonut = ({ escs }: Props) => {
  let consumptions: Record<string, number> = {};
  escs.forEach((esc) => {
    consumptions[esc.name] = getLatestValue(esc.data[CONSUMPTION]);
  });
  const config = useRobotConfig();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalConsumption = calculateTotal(Object.values(consumptions));
  const maxConsumption =
    config?.escConfigs[0]?.measurementConfigs[CONSUMPTION].max ?? 0;

  // create labels
  // TODO: maybe do on canvas
  const labels: ReactNode[] = [];
  let angle = 0;
  Object.keys(consumptions).forEach((esc) => {
    const value = consumptions[esc];
    const percent = totalConsumption > 0 ? (value / totalConsumption) * 100 : 0;
    const strokeWidth = 10;
    const sliceAngle = (percent / 100) * 360;

    if (value > 0) {
      const labelAngleRadians = (angle - 90 + sliceAngle / 2) * (Math.PI / 180);
      const labelRadius = radius + strokeWidth * 2;
      const translateX = Math.cos(labelAngleRadians) * labelRadius;
      const translateY = Math.sin(labelAngleRadians) * labelRadius;

      labels.push(
        <Label
          key={esc}
          style={{
            left: "50%",
            bottom: "50%",
            transform: `translate(calc(${translateX < 0 ? "-100" : "0"}% + ${translateX}px), calc(50% + ${translateY}px))`,
          }}
        >
          {esc}: {value}
        </Label>,
      );
    }

    angle += sliceAngle;
  });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = svgSize * dpr;
    canvas.height = svgSize * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const strokeWidth = 10;
    const startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, svgSize, svgSize);

    angle = 0;

    Object.keys(consumptions).forEach((esc, index) => {
      const value = consumptions[esc];
      const percent =
        totalConsumption > 0 ? (value / totalConsumption) * 100 : 0;
      const color = ESC_COLORS[index];

      if (value > 0) {
        const sliceAngle = (percent / 100) * 2 * Math.PI;
        const endAngle = startAngle + angle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle + angle, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();

        angle += sliceAngle;
      }
    });
  }, [escs]);

  return (
    <Container>
      <h3>Consumption</h3>
      <StyledContainer>
        <CanvasWrapper>
          <Canvas ref={canvasRef} width={svgSize} height={svgSize} />
          <TotalLabel>
            <p>
              {totalConsumption}/{maxConsumption}
            </p>
            <p>mAh</p>
          </TotalLabel>
          {labels}
        </CanvasWrapper>
      </StyledContainer>
    </Container>
  );
};
