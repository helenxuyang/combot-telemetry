import { ColorIndicator } from "./features/configuration/configUtils";

export const DEFAULT_COLOR = "skyblue";
export const HIGHLIGHT_COLOR = "green";

export const getColor = (value: number, colorIndicators: ColorIndicator[]) => {
  let barColor = DEFAULT_COLOR;

  if (!colorIndicators) {
    return barColor;
  }

  // TODO: this is cursed, rethink this
  colorIndicators
    .toSorted((a, b) => b.threshold - a.threshold)
    .filter((indicator) => indicator.condition === "below")
    .forEach((indicator) => {
      if (value <= indicator.threshold) {
        barColor = indicator.color;
      }
    });

  colorIndicators
    .toSorted((a, b) => a.threshold - b.threshold)
    .filter((indicator) => indicator.condition === "above")
    .forEach((indicator) => {
      if (value >= indicator.threshold) {
        barColor = indicator.color;
      }
    });

  return barColor;
};

export const getClampedPercent = (value: number, min: number, max: number) => {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.round(Math.max(Math.min(percent, 100), 0));
};

export const getLatestValue = (values: number[]) => {
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

// set minimum width to prevent flickering when value changes length
export const getDisplayMinCharacters = (
  min: number,
  max: number,
  decimals: number,
  unit: string,
) => {
  return (
    Math.max(String(min).length, String(max).length) + // value
    (decimals ? 1 + decimals : 0) + // decimal point and decimals
    (unit.length ? 1 + unit.length : 0) // space and unit
  );
};
