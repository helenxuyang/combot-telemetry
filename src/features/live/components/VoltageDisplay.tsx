import styled from "styled-components";
import { ESC, VOLTAGE } from "../../../robot";
import { Container, PLOT_BASE_COLOR, Value } from "../../../styles";
import { getClampedPercent, getLatestValue } from "../../../dataUtils";
import { useLayoutEffect, useRef } from "react";

const BarDisplay = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const StyledContainer = styled(Container)`
  height: 100%;
`;
const BarHolder = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 25px;
  background-color: ${PLOT_BASE_COLOR};
  margin: 8px;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const ValueText = styled.p<{ $percent: number }>`
  position: absolute;
  left: ${({ $percent }) => `${$percent}%`};
  top: 100%;
  font-size: 12px;
`;

const MinValueText = styled(ValueText)`
  transform: translateX(-110%);
`;

const RangeText = styled.p`
  font-size: 12px;
`;

type Props = {
  escs: ESC[];
  min: number;
  max: number;
};

export const VoltageDisplay = ({ escs, min, max }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const values = escs.map((esc) => getLatestValue(esc.data[VOLTAGE]));

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const minPercent = getClampedPercent(minValue, min, max);
  const maxPercent = getClampedPercent(maxValue, min, max);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width, height };
    };

    const { width, height } = resizeCanvas();

    const currentMarkers = values.map((value) =>
      getClampedPercent(value, min, max),
    );

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = PLOT_BASE_COLOR;
    ctx.fillRect(0, 0, width, height);

    const minWidth = (width * minPercent) / 100;
    const maxWidth = (width * (maxPercent - minPercent)) / 100;

    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, minWidth, height);

    ctx.fillStyle = "cornflowerblue";
    ctx.fillRect(minWidth, 0, maxWidth, height);

    ctx.fillStyle = "black";
    currentMarkers.forEach((percent) => {
      const x = Math.round((width * percent) / 100);
      ctx.fillRect(x - 1, 0, 2, height);
    });
  }, [escs]);

  return (
    <StyledContainer>
      <h2>Battery Voltage</h2>
      <BarDisplay>
        <RangeText>{min}</RangeText>
        <BarHolder>
          <Canvas ref={canvasRef} />
          {minValue !== maxValue && (
            <MinValueText $percent={minPercent}>{minValue}</MinValueText>
          )}
          <ValueText $percent={maxPercent}>{maxValue}</ValueText>
        </BarHolder>
        <RangeText>{max}</RangeText>
      </BarDisplay>
      <Value>
        {minValue === maxValue ? minValue : `${minValue}-${maxValue}` + " V"}
      </Value>
    </StyledContainer>
  );
};
