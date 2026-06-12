import styled from "styled-components";
import { type Measurement } from "./robot";
import { getLatestValue, getColor, getLatestValueDisplay } from "./dataUtils";
import { useEffect, useRef } from "react";

type Props = {
  outerMeasurement: Measurement;
  innerMeasurement: Measurement;
  barColor?: string;
  className?: string;
};

const CanvasWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 400px;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: auto;
  display: block;
`;

const drawArc = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  strokeWidth: number,
  anticlockwise = false,
) => {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise);
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
};

const width = 300;
const height = width / 2 + 50;

const outerStrokeWidth = 50;
const outerRadius = width / 2 - outerStrokeWidth / 2;
const canvasHeight = height;

const innerScale = 0.6;
const innerRadius = outerRadius * innerScale;

export const ArcDisplay = ({
  outerMeasurement: outer,
  innerMeasurement: inner,
  className,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const outerMeasurementRef = useRef(outer);
  const innerMeasurementRef = useRef(inner);
  const outerDataRef = useRef({
    value: getLatestValue(outer.values),
    min: outer.min,
    max: outer.max,
    color: getColor(outer),
    target: outer.highlightThreshold ?? 0,
  });
  const innerDataRef = useRef({
    value: getLatestValue(inner.values),
    min: inner.min,
    max: inner.max,
    color: getColor(inner),
  });

  const outerValue = getLatestValue(outer.values);
  const innerValue = getLatestValue(inner.values);
  const outerColor = getColor(outer);
  const innerColor = getColor(inner);
  const target = outer.highlightThreshold ?? 0;

  useEffect(() => {
    outerMeasurementRef.current = outer;
    innerMeasurementRef.current = inner;
    outerDataRef.current = {
      value: outerValue,
      min: outer.min,
      max: outer.max,
      color: outerColor,
      target,
    };
    innerDataRef.current = {
      value: innerValue,
      min: inner.min,
      max: inner.max,
      color: innerColor,
    };
  }, [
    outerValue,
    innerValue,
    outer.min,
    outer.max,
    outerColor,
    inner.min,
    inner.max,
    innerColor,
    target,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = width / 2;
    const centerY = outerRadius + outerStrokeWidth / 2 + 50;

    const render = () => {
      const outerData = outerDataRef.current;
      const innerData = innerDataRef.current;

      ctx.clearRect(0, 0, width, canvasHeight);

      drawArc(
        ctx,
        centerX,
        centerY,
        outerRadius,
        Math.PI,
        2 * Math.PI,
        "white",
        outerStrokeWidth,
        false,
      );
      const outerPercent = Math.max(
        Math.min(
          (outerData.value - outerData.min) / (outerData.max - outerData.min),
          1,
        ),
        0,
      );
      drawArc(
        ctx,
        centerX,
        centerY,
        outerRadius,
        Math.PI,
        Math.PI + outerPercent * Math.PI,
        outerData.color,
        outerStrokeWidth,
        false,
      );

      if (outerData.target > 0) {
        const onePercent = (outerData.max - outerData.min) / 100;
        const targetStart = outerData.target - onePercent / 2;
        const targetEnd = outerData.target + onePercent / 2;
        const targetStartAngle =
          Math.PI +
          Math.max(
            Math.min(
              (targetStart - outerData.min) / (outerData.max - outerData.min),
              1,
            ),
            0,
          ) *
            Math.PI;
        const targetEndAngle =
          Math.PI +
          Math.max(
            Math.min(
              (targetEnd - outerData.min) / (outerData.max - outerData.min),
              1,
            ),
            0,
          ) *
            Math.PI;
        drawArc(
          ctx,
          centerX,
          centerY,
          outerRadius,
          targetStartAngle,
          targetEndAngle,
          "darkgreen",
          outerStrokeWidth,
          false,
        );
      }

      drawArc(
        ctx,
        centerX,
        centerY,
        innerRadius,
        Math.PI,
        2 * Math.PI,
        "white",
        outerStrokeWidth / 2,
        false,
      );
      const innerPercent = Math.max(
        Math.min(
          (innerData.value - innerData.min) / (innerData.max - innerData.min),
          1,
        ),
        0,
      );
      drawArc(
        ctx,
        centerX,
        centerY,
        innerRadius,
        Math.PI,
        Math.PI + innerPercent * Math.PI,
        innerData.color,
        outerStrokeWidth / 2,
        false,
      );

      // Draw outer label
      ctx.fillStyle = "black";
      ctx.font = "bold 30px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(
        getLatestValueDisplay(outerMeasurementRef.current),
        centerX,
        35,
      );

      // Draw inner label
      ctx.font = "bold 24px system-ui";
      ctx.fillText(
        getLatestValueDisplay(innerMeasurementRef.current),
        centerX,
        canvasHeight - 10,
      );

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      <CanvasWrapper>
        <Canvas
          ref={canvasRef}
          style={{
            width: width,
            height: height,
          }}
        />
      </CanvasWrapper>
    </div>
  );
};
