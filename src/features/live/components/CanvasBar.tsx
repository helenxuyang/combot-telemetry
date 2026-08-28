import styled from "styled-components";
import { useLayoutEffect, useRef } from "react";
import { PLOT_BASE_COLOR } from "../../../styles";

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

    const draw = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
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
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [percent, color, orientation]);

  return <Canvas ref={canvasRef} className={className} />;
};
