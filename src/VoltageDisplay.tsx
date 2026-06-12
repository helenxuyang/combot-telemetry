import styled from "styled-components";
import { VOLTAGE, type Robot } from "./robot";
import { Container, Value } from "./styles";
import { getClampedPercent, getLatestValue } from "./dataUtils";
import { useEffect, useRef } from "react";

const BarDisplay = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const BarHolder = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 25px;
  background-color: white;
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
  escs: Robot["escs"];
};

export const VoltageDisplay = ({ escs }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const latestValuesRef = useRef<number[]>([]);
  const minPercentRef = useRef(0);
  const maxPercentRef = useRef(0);
  const minValueRef = useRef(0);
  const maxValueRef = useRef(0);

  const latestValues = Object.values(escs)
    .filter((esc) => esc.measurements[VOLTAGE].shouldShow)
    .map((esc) => getLatestValue(esc.measurements[VOLTAGE].values));

  const min = Math.min(
    ...Object.values(escs).map((esc) => esc.measurements[VOLTAGE].min),
  );

  const max = Math.min(
    ...Object.values(escs).map((esc) => esc.measurements[VOLTAGE].max),
  );

  const minValue = Math.min(...latestValues);
  const maxValue = Math.max(...latestValues);
  const minPercent = getClampedPercent(minValue, min, max);
  const maxPercent = getClampedPercent(maxValue, min, max);

  useEffect(() => {
    latestValuesRef.current = latestValues;
    minPercentRef.current = minPercent;
    maxPercentRef.current = maxPercent;
    minValueRef.current = minValue;
    maxValueRef.current = maxValue;
  }, [latestValues, minPercent, maxPercent, minValue, maxValue]);

  useEffect(() => {
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

    const render = () => {
      const currentMinPercent = minPercentRef.current;
      const currentMaxPercent = maxPercentRef.current;
      const currentMarkers = latestValuesRef.current.map((value) =>
        getClampedPercent(value, min, max),
      );

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      const minWidth = (width * currentMinPercent) / 100;
      const maxWidth = (width * (currentMaxPercent - currentMinPercent)) / 100;

      ctx.fillStyle = "skyblue";
      ctx.fillRect(0, 0, minWidth, height);

      ctx.fillStyle = "cornflowerblue";
      ctx.fillRect(minWidth, 0, maxWidth, height);

      ctx.fillStyle = "black";
      currentMarkers.forEach((percent) => {
        const x = Math.round((width * percent) / 100);
        ctx.fillRect(x - 1, 0, 2, height);
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [min, max]);

  return (
    <Container>
      <h4>Battery Voltage</h4>
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
    </Container>
  );
};
