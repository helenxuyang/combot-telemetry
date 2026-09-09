import { useLayoutEffect, useRef } from "react";
import {
  getClampedValue,
  getColor,
  getLatestValueDisplay,
} from "../../../dataUtils";
import { PLOT_BASE_COLOR } from "../../../styles";
import { ColorIndicator } from "../../configuration/configTypes";

type Props = {
  innerValue: number;
  innerUnit: string;
  innerMin: number;
  innerMax: number;
  innerColorIndicators: ColorIndicator[];
  outerValue: number;
  outerUnit: string;
  outerMin: number;
  outerMax: number;
  outerColorIndicators: ColorIndicator[];
  maxWidth: number;
  defaultColor?: string;
  className?: string;
};

export const ArcDisplay = ({
  innerValue,
  innerUnit,
  innerMin,
  innerMax,
  innerColorIndicators,
  outerValue,
  outerUnit,
  outerMin,
  outerMax,
  outerColorIndicators,
  maxWidth,
  defaultColor,
  className,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspectRatio = 5 / 7;
  let width = maxWidth;
  let height = width * aspectRatio;

  const outerStrokeWidth = width / 8;
  const outerRadius = width / 2 - outerStrokeWidth / 2;
  const canvasHeight = height;

  const innerScale = 0.6;
  const innerRadius = outerRadius * innerScale;
  const innerStrokeWidth = outerStrokeWidth / 2;

  const centerX = width / 2;
  const centerY = height * 0.9;

  const outerLabelY = height * 0.15;
  const outerLabelFontSize = getClampedValue(width / 10, 20, 50);
  const innerLabelY = centerY - height * 0.07;
  const innerLabelFontSize = getClampedValue(width / 12, 20, 50);

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
    radius: number,
    width: number,
  ) => {
    for (let colorIndicator of colorIndicators) {
      const { threshold: value } = colorIndicator;
      const onePercent = (max - min) / 100;
      const targetStart = value - onePercent / 4;
      const targetEnd = value + onePercent / 4;
      const targetStartAngle =
        Math.PI +
        Math.max(Math.min((targetStart - min) / (max - min), 1), 0) * Math.PI;
      const targetEndAngle =
        Math.PI +
        Math.max(Math.min((targetEnd - min) / (max - min), 1), 0) * Math.PI;
      drawArc(
        ctx,
        radius,
        targetStartAngle,
        targetEndAngle,
        "black",
        width,
        false,
      );
    }
  };

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
      PLOT_BASE_COLOR,
      outerStrokeWidth,
      false,
    );

    const outerPercent = Math.max(
      Math.min((outerValue - outerMin) / (outerMax - outerMin), 1),
      0,
    );
    const outerColor = getColor(outerValue, outerColorIndicators, defaultColor);

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
    drawMarks(
      ctx,
      outerMin,
      outerMax,
      outerColorIndicators,
      outerRadius,
      outerStrokeWidth,
    );

    const innerPercent = Math.max(
      Math.min((innerValue - innerMin) / (innerMax - innerMin), 1),
      0,
    );
    const innerColor = getColor(innerValue, innerColorIndicators, defaultColor);

    // outer label
    ctx.fillStyle = "black";
    ctx.font = `bold ${outerLabelFontSize}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(
      getLatestValueDisplay(outerValue, outerUnit, outerMin, outerMax),
      centerX,
      outerLabelY,
    );

    // min and max labels
    const minMaxLabelFontSize = Math.min(outerLabelFontSize / 2, 16);
    const minMaxLabelOuterOffset = outerStrokeWidth / 2;
    const minMaxLabelOffsetInnerPosition = width * 0.21;
    const minMaxLabelOffsetInnerOffset = innerStrokeWidth / 2;
    const minMaxLabelHeight = centerY + outerLabelFontSize / 2;
    ctx.font = `${minMaxLabelFontSize}px system-ui`;
    // outer min
    ctx.fillText(String(outerMin), minMaxLabelOuterOffset, minMaxLabelHeight);
    // outer max
    ctx.fillText(
      String(outerMax),
      width - minMaxLabelOuterOffset,
      minMaxLabelHeight,
    );
    // inner min
    ctx.fillText(
      String(innerMin),
      minMaxLabelOffsetInnerPosition + minMaxLabelOffsetInnerOffset,
      minMaxLabelHeight,
    );
    // inner max
    ctx.fillText(
      String(innerMax),
      width - minMaxLabelOffsetInnerPosition - minMaxLabelOffsetInnerOffset,
      minMaxLabelHeight,
    );

    // inner base
    drawArc(
      ctx,
      innerRadius,
      Math.PI,
      2 * Math.PI,
      PLOT_BASE_COLOR,
      innerStrokeWidth,
      false,
    );

    // inner fill
    drawArc(
      ctx,
      innerRadius,
      Math.PI,
      Math.PI + innerPercent * Math.PI,
      innerColor,
      innerStrokeWidth,
      false,
    );

    // inner indicators
    drawMarks(
      ctx,
      innerMin,
      innerMax,
      innerColorIndicators,
      innerRadius,
      innerStrokeWidth,
    );

    // inner label
    ctx.textAlign = "center";
    ctx.font = `bold ${innerLabelFontSize}px system-ui`;
    ctx.fillText(
      getLatestValueDisplay(innerValue, innerUnit, innerMin, innerMax),
      centerX,
      innerLabelY,
    );
  }, [
    width,
    innerValue,
    innerUnit,
    innerMin,
    innerMax,
    innerColorIndicators,
    outerValue,
    outerUnit,
    outerMin,
    outerMax,
    outerColorIndicators,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width,
        height,
        maxWidth: "100%",
        maxHeight: "100%",
      }}
      className={className}
    />
  );
};
