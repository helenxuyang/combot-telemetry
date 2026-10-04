import { PLOT_BASE_COLOR } from "./styles";

type Props = {
  xInput: number;
  xMax?: number;
  yInput: number;
  yMax?: number;
  showLabels?: boolean;
  joystickColor?: string;
};

export const JoystickDisplay = ({
  xInput,
  xMax = 44,
  yInput,
  yMax = 100,
  showLabels = true,
  joystickColor = "black",
}: Props) => {
  const size = 100;
  const xPercent = xInput / xMax;
  const yPercent = yInput / yMax;

  const xPosition = size / 2 + xPercent * (size / 2);
  const yPosition = size / 2 + yPercent * -(size / 2);

  const labelOffsetPercent = 0.08;

  return (
    <svg width={size} height={size} overflow="visible">
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        fill="none"
        stroke={PLOT_BASE_COLOR}
        strokeWidth="2"
      />
      <line
        x1={size / 2}
        y1="0"
        x2={size / 2}
        y2={size}
        stroke={PLOT_BASE_COLOR}
        strokeWidth="2"
      />
      <line
        x1="0"
        y1={size / 2}
        x2={size}
        y2={size / 2}
        stroke={PLOT_BASE_COLOR}
        strokeWidth="2"
      />
      <line
        x1={size / 2}
        y1={size / 2}
        x2={xPosition}
        y2={yPosition}
        stroke={joystickColor}
        strokeWidth="4"
      />
      <circle cx={xPosition} cy={yPosition} r={6} fill={joystickColor} />
      {showLabels && (
        <>
          <text
            x={size * (1 + labelOffsetPercent)}
            y={size / 2}
            dominantBaseline="middle"
            fontFamily="Arial"
            fontSize="12"
            fill="black"
          >
            {xMax}
          </text>
          <text
            x={-size * labelOffsetPercent}
            y={size / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily="Arial"
            fontSize="12"
            fill="black"
          >
            {-xMax}
          </text>
          <text
            x={size / 2}
            y={size * (1 + labelOffsetPercent)}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontFamily="Arial"
            fontSize="12"
            fill="black"
          >
            {-yMax}
          </text>
          <text
            x={size / 2}
            y={-size * labelOffsetPercent}
            textAnchor="middle"
            fontFamily="Arial"
            fontSize="12"
            fill="black"
          >
            {yMax}
          </text>
        </>
      )}
    </svg>
  );
};
