import { getDisplayMinCharacters, getLatestValue } from "../../../dataUtils";
import { METADATA } from "../../../displayUtils";
import { Measurement, MeasurementName } from "../../../robot";
import { MeasurementConfig } from "../../configuration/configUtils";
import { BarDisplay } from "./BarDisplay";

type Props = {
  name: MeasurementName;
  measurement: Measurement;
  config: MeasurementConfig;
  className?: string;
  orientation?: "vertical" | "horizontal";
};

export const MeasurementBarDisplay = ({
  name,
  measurement,
  config,
  ...rest
}: Props) => {
  const { displayName, unit, decimals } = METADATA[name];
  // prevent flickering when length changes
  const minCharacters = getDisplayMinCharacters(
    config.min,
    config.max,
    decimals,
    unit,
  );

  return (
    <BarDisplay
      name={displayName}
      value={getLatestValue(measurement.values)}
      unit={unit}
      min={config.min}
      max={config.max}
      colorIndicators={config.colorIndicators}
      valueMinCharacters={minCharacters}
      {...rest}
    />
  );
};
