import { getLatestValue } from "../../../dataUtils";
import { Measurement, MeasurementName } from "../../../robot";
import { MeasurementConfig } from "../../configuration/configUtils";
import { ArcDisplay } from "./ArcDisplay";

type Props = {
  innerName: MeasurementName;
  innerMeasurement: Measurement;
  innerConfig: MeasurementConfig;
  outerName: MeasurementName;
  outerMeasurement: Measurement;
  outerConfig: MeasurementConfig;
  className?: string;
};

export const MeasurementArcDisplay = ({
  innerName,
  innerMeasurement,
  innerConfig,
  outerName,
  outerMeasurement,
  outerConfig,
  className,
}: Props) => {
  return (
    <ArcDisplay
      innerName={innerName}
      innerValue={getLatestValue(innerMeasurement.values)}
      innerMin={innerConfig.min}
      innerMax={innerConfig.max}
      innerColorIndicators={innerConfig.colorIndicators}
      outerName={outerName}
      outerValue={getLatestValue(outerMeasurement.values)}
      outerMin={outerConfig.min}
      outerMax={outerConfig.max}
      outerColorIndicators={outerConfig.colorIndicators}
      className={className}
    />
  );
};
