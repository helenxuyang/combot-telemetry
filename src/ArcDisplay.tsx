import styled from "styled-components";
import { getColor, getLatestValueDisplay } from "./dataUtils";
import { useCallback, useEffect, useRef } from "react";
import { MeasurementConfig, MeasurementName, Threshold } from "./robot";
import { METADATA } from "./displayUtils";

type Props = {
  innerName: MeasurementName;
  innerValue: number;
  innerConfig: MeasurementConfig;
  outerName: MeasurementName;
  outerValue: number;
  outerConfig: MeasurementConfig;
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

const width = 300;
const height = width / 2 + 50;

const outerStrokeWidth = 50;
const outerRadius = width / 2 - outerStrokeWidth / 2;
const canvasHeight = height;

const innerScale = 0.6;
const innerRadius = outerRadius * innerScale;

const centerX = width / 2;
const centerY = outerRadius + outerStrokeWidth / 2 + 50;

export const ArcDisplay = ({
  innerName,
  innerValue,
  innerConfig,
  outerName,
  outerValue,
  outerConfig,
  className,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawArc = useCallback(
    (
      radius: number,
      startAngle: number,
      endAngle: number,
      color: string,
      strokeWidth: number,
      anticlockwise = false,
    ) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    },
    [],
  );

  const drawMarks = useCallback(
    (min: number, max: number, thresholds: Threshold[]) => {
      for (let threshold of thresholds) {
        const { value } = threshold;
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
          outerRadius,
          targetStartAngle,
          targetEndAngle,
          "darkgreen",
          outerStrokeWidth,
          false,
        );
      }
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, canvasHeight);

    // outer base
    drawArc(
      outerRadius,
      Math.PI,
      2 * Math.PI,
      "white",
      outerStrokeWidth,
      false,
    );

    const outerPercent = Math.max(
      Math.min(
        (outerValue - outerConfig.min) / (outerConfig.max - outerConfig.min),
        1,
      ),
      0,
    );
    const outerColor = getColor(outerValue, outerConfig.thresholds);

    // outer fill
    drawArc(
      outerRadius,
      Math.PI,
      Math.PI + outerPercent * Math.PI,
      outerColor,
      outerStrokeWidth,
      false,
    );

    // outer thresholds
    drawMarks(outerConfig.min, outerConfig.max, outerConfig.thresholds);

    const innerPercent = Math.max(
      Math.min(
        (innerValue - innerConfig.min) / (innerConfig.max - innerConfig.min),
        1,
      ),
      0,
    );
    const innerColor = getColor(innerValue, innerConfig.thresholds);

    // outer label
    ctx.fillStyle = "black";
    ctx.font = "bold 30px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      getLatestValueDisplay(
        outerValue,
        METADATA[outerName].unit,
        outerConfig.min,
        outerConfig.max,
      ),
      centerX,
      35,
    );

    // inner base
    drawArc(
      innerRadius,
      Math.PI,
      2 * Math.PI,
      "white",
      outerStrokeWidth / 2,
      false,
    );

    // inner fill
    drawArc(
      innerRadius,
      Math.PI,
      Math.PI + innerPercent * Math.PI,
      innerColor,
      outerStrokeWidth / 2,
      false,
    );

    // inner thresholds
    drawMarks(innerConfig.min, innerConfig.max, innerConfig.thresholds);

    // inner label
    ctx.font = "bold 24px system-ui";
    ctx.fillText(
      getLatestValueDisplay(
        innerValue,
        METADATA[innerName].unit,
        innerConfig.min,
        innerConfig.max,
      ),
      centerX,
      canvasHeight - 10,
    );
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
