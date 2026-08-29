import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { PLOT_BASE_COLOR } from "../../../styles";

type Orientation = "horizontal" | "vertical";

type Props = {
  percent: number;
  color: string;
  orientation: Orientation;
  className?: string;
};

export const getCanvasDimensions = (
  width: number,
  height: number,
  dpr: number,
) => ({
  width: Math.max(width, 1) * dpr,
  height: Math.max(height, 1) * dpr,
  dpr,
});

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

export const CanvasBar = ({
  percent,
  color,
  orientation,
  className,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    const dimensions = getCanvasDimensions(width, height, dpr);

    if (
      canvas.width !== dimensions.width ||
      canvas.height !== dimensions.height
    ) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = PLOT_BASE_COLOR;
    ctx.fillRect(0, 0, width, height);

    if (percent > 0) {
      ctx.fillStyle = color;
      if (orientation === "vertical") {
        const fillHeight = (height * percent) / 100;
        ctx.fillRect(0, height - fillHeight, width, fillHeight);
      } else {
        const fillWidth = (width * percent) / 100;
        ctx.fillRect(0, 0, fillWidth, height);
      }
    }
  }, [percent, color, orientation]);

  return <Canvas ref={canvasRef} className={className} />;
};
