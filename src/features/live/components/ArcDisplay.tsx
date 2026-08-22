import styled from "styled-components";
import { getColor, getLatestValueDisplay } from "../../../dataUtils";
import { useLayoutEffect, useRef } from "react";
import { MeasurementName } from "../../../robot";
import { METADATA } from "../../../displayUtils";
import { ColorIndicator } from "../../configuration/configUtils";

type Props = {
  innerName: MeasurementName;
  innerValue: number;
  innerMin: number;
  innerMax: number;
  innerColorIndicators: ColorIndicator[];
  outerName: MeasurementName;
  outerValue: number;
  outerMin: number;
  outerMax: number;
  outerColorIndicators: ColorIndicator[];
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

// TODO: fix super fragile sizing
const width = 280;
const height = width * 0.75;
const innerValueY = 180;

const outerStrokeWidth = 50;
const outerRadius = width / 2 - outerStrokeWidth / 2;
const canvasHeight = height;

const innerScale = 0.6;
const innerRadius = outerRadius * innerScale;

const centerX = width / 2;
const centerY = outerRadius + outerStrokeWidth / 2 + 50;

const drawArc = (
  ctx: CanvasRenderingContext2D,
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

const drawMarks = (
  ctx: CanvasRenderingContext2D,
  min: number,
  max: number,
  colorIndicators: ColorIndicator[],
) => {
  for (let colorIndicator of colorIndicators) {
    const { threshold: value } = colorIndicator;
    const onePercent = (max - min) / 100;
    const targetStart = value - onePercent / 2;
    const targetEnd = value + onePercent / 2;
    const targetStartAngle =
      Math.PI +
      Math.max(Math.min((targetStart - min) / (max - min), 1), 0) * Math.PI;
    const targetEndAngle =
      Math.PI +
      Math.max(Math.min((targetEnd - min) / (max - min), 1), 0) * Math.PI;
    drawArc(
      ctx,
      outerRadius,
      targetStartAngle,
      targetEndAngle,
      "darkgreen",
      outerStrokeWidth,
      false,
    );
  }
};

export const ArcDisplay = ({
  innerName,
  innerValue,
  innerMin,
  innerMax,
  innerColorIndicators,
  outerName,
  outerValue,
  outerMin,
  outerMax,
  outerColorIndicators,
  className,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, canvasHeight);

    // outer base
    drawArc(
      ctx,
      outerRadius,
      Math.PI,
      2 * Math.PI,
      "white",
      outerStrokeWidth,
      false,
    );

    const outerPercent = Math.max(
      Math.min((outerValue - outerMin) / (outerMax - outerMin), 1),
      0,
    );
    const outerColor = getColor(outerValue, outerColorIndicators);

    // outer fill
    drawArc(
      ctx,
      outerRadius,
      Math.PI,
      Math.PI + outerPercent * Math.PI,
      outerColor,
      outerStrokeWidth,
      false,
    );

    // outer indicators
    drawMarks(ctx, outerMin, outerMax, outerColorIndicators);

    const innerPercent = Math.max(
      Math.min((innerValue - innerMin) / (innerMax - innerMin), 1),
      0,
    );
    const innerColor = getColor(innerValue, innerColorIndicators);

    // outer label
    ctx.fillStyle = "black";
    ctx.font = "bold 30px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      getLatestValueDisplay(
        outerValue,
        METADATA[outerName].unit,
        outerMin,
        outerMax,
      ),
      centerX,
      35,
    );

    // inner base
    drawArc(
      ctx,
      innerRadius,
      Math.PI,
      2 * Math.PI,
      "white",
      outerStrokeWidth / 2,
      false,
    );

    // inner fill
    drawArc(
      ctx,
      innerRadius,
      Math.PI,
      Math.PI + innerPercent * Math.PI,
      innerColor,
      outerStrokeWidth / 2,
      false,
    );

    // inner indicators
    drawMarks(ctx, innerMin, innerMax, innerColorIndicators);

    // inner label
    ctx.font = "bold 24px system-ui";
    ctx.fillText(
      getLatestValueDisplay(
        innerValue,
        METADATA[innerName].unit,
        innerMin,
        innerMax,
      ),
      centerX,
      innerValueY,
    );
  }, [
    innerName,
    innerValue,
    innerMin,
    innerMax,
    innerColorIndicators,
    outerName,
    outerValue,
    outerMin,
    outerMax,
    outerColorIndicators,
  ]);

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
