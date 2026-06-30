import styled from "styled-components";
import { useLayoutEffect, useRef } from "react";

type Orientation = "horizontal" | "vertical";

type Props = {
  percent: number;
  color: string;
  orientation: Orientation;
  className?: string;
};

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

    const resizeCanvas = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width, height };
    };

    const { width, height } = resizeCanvas();
    const currentPercent = percent;
    const currentColor = color;
    const drawWidth = width;
    const drawHeight = height;

    ctx.clearRect(0, 0, drawWidth, drawHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, drawWidth, drawHeight);

    if (currentPercent > 0) {
      ctx.fillStyle = currentColor;
      if (orientation === "vertical") {
        const fillHeight = (drawHeight * currentPercent) / 100;
        ctx.fillRect(0, drawHeight - fillHeight, drawWidth, fillHeight);
      } else {
        const fillWidth = (drawWidth * currentPercent) / 100;
        ctx.fillRect(0, 0, fillWidth, drawHeight);
      }
    }
  }, [percent, color, orientation]);

  return <Canvas ref={canvasRef} className={className} />;
};
