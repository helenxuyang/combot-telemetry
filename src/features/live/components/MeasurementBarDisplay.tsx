import { getLatestValue } from "../../../dataUtils";
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
  return (
    <BarDisplay
      name={METADATA[name].displayName}
      value={getLatestValue(measurement.values)}
      unit={METADATA[name].unit}
      min={config.min}
      max={config.max}
      colorIndicators={config.colorIndicators}
      {...rest}
    />
  );
};
