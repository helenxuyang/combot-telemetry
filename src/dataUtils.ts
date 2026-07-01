import { ColorIndicator, type Measurement } from "./robot";

export const DEFAULT_COLOR = "skyblue";
export const HIGHLIGHT_COLOR = "green";

export const getColor = (value: number, colorIndicators: ColorIndicator[]) => {
  let barColor = DEFAULT_COLOR;

  if (!colorIndicators) {
    return barColor;
  }

  // TODO: this assumes they're sorted properly already
  colorIndicators.forEach((indicator) => {
    const isConditionMet =
      indicator.condition === "below"
        ? value <= indicator.threshold
        : value >= indicator.threshold;
    if (isConditionMet) {
      barColor = indicator.color;
    }
  });

  return barColor;
};

export const getClampedPercent = (value: number, min: number, max: number) => {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.round(Math.max(Math.min(percent, 100), 0));
};

export const getLatestValue = (values: Measurement["values"]) => {
  return values.at(-1) ?? 0;
};

export const getLatestValueDisplay = (
  value: number,
  unit: string,
  min: number,
  max: number,
) => {
  if (unit === "%") {
    return `${getClampedPercent(value, min, max)}%`;
  } else {
    return `${value} ${unit}`;
  }
};

export const calculateTotal = (values: number[]) => {
  const total = values.reduce((sum, curr) => sum + curr, 0);
  return Number(total.toFixed(2));
};
