import styled from "styled-components";
import { PLOT_BASE_COLOR } from "../../../styles";

type Orientation = "horizontal" | "vertical";

type Props = {
  percent: number;
  color: string;
  orientation: Orientation;
  className?: string;
  isDirectional?: boolean;
};

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`;

export const Bar = ({
  percent,
  color,
  orientation,
  className,
  isDirectional = false,
}: Props) => {
  const hasFill = isDirectional || percent >= 0;
  const fillStart = isDirectional ? 50 : 0;
  const fillSize = isDirectional ? percent / 2 : percent;

  let x = 0;
  let y = 0;
  let width = 100;
  let height = 100;

  if (orientation === "horizontal") {
    x = isDirectional ? Math.min(fillStart, fillStart + fillSize) : 0;
    width = isDirectional ? Math.abs(fillSize) : percent;
  } else {
    y = isDirectional
      ? Math.min(fillStart, fillStart - fillSize)
      : 100 - percent;
    height = isDirectional ? Math.abs(fillSize) : percent;
  }

  return (
    <StyledSvg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      overflow="visible"
      aria-hidden="true"
    >
      <rect width="100" height="100" fill={PLOT_BASE_COLOR} />
      {hasFill && (
        <rect x={x} y={y} width={width} height={height} fill={color} />
      )}
      {isDirectional &&
        (orientation === "vertical" ? (
          <line
            x1="-10"
            y1="50"
            x2="110"
            y2="50"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <line
            x1="50"
            y1="-10"
            x2="50"
            y2="110"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
    </StyledSvg>
  );
};
