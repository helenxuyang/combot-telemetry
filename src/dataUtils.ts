import { Threshold, type Measurement } from "./robot";

export const DEFAULT_COLOR = "skyblue";
export const HIGHLIGHT_COLOR = "green";

export const getColor = (value: number, thresholds: Threshold[]) => {
  let barColor = DEFAULT_COLOR;

  if (!thresholds) {
    return barColor;
  }

  // TODO: this assumes they're sorted properly already
  thresholds.forEach((threshold) => {
    const isConditionMet =
      threshold.condition === "below"
        ? value < threshold.value
        : value > threshold.value;
    if (isConditionMet) {
      barColor = threshold.color;
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

export const getLatestPercent = (value: number, min: number, max: number) => {
  return getClampedPercent(value, min, max);
};

export const getLatestValueDisplay = (
  value: number,
  unit: string,
  min: number,
  max: number,
) => {
  if (unit === "%") {
    return `${getLatestPercent(value, min, max)}%`;
  } else {
    return `${value}${unit && ` ${unit}`}`;
  }
};

export const calculateTotal = (values: number[]) => {
  const total = values.reduce((sum, curr) => sum + curr, 0);
  return Number(total.toFixed(2));
};
