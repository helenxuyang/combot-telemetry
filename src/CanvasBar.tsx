import styled from "styled-components";
import { useEffect, useRef } from "react";

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
  const animationRef = useRef<number | null>(null);
  const percentRef = useRef(percent);
  const colorRef = useRef(color);

  useEffect(() => {
    percentRef.current = percent;
    colorRef.current = color;
  }, [percent, color]);

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
      const currentPercent = percentRef.current;
      const currentColor = colorRef.current;
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

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [orientation]);

  return <Canvas ref={canvasRef} className={className} />;
};
