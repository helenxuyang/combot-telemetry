import { getLatestValue } from "../../../dataUtils";
import { MeasurementName } from "../../../robot";
import { MeasurementConfig } from "../../configuration/configUtils";
import { ArcDisplay } from "./ArcDisplay";

type Props = {
  innerName: MeasurementName;
  innerValues: number[];
  innerConfig: MeasurementConfig;
  outerName: MeasurementName;
  outerValues: number[];
  outerConfig: MeasurementConfig;
  className?: string;
};

export const MeasurementArcDisplay = ({
  innerName,
  innerValues,
  innerConfig,
  outerName,
  outerValues,
  outerConfig,
  className,
}: Props) => {
  return (
    <ArcDisplay
      innerName={innerName}
      innerValue={getLatestValue(innerValues)}
      innerMin={innerConfig.min}
      innerMax={innerConfig.max}
      innerColorIndicators={innerConfig.colorIndicators}
      outerName={outerName}
      outerValue={getLatestValue(outerValues)}
      outerMin={outerConfig.min}
      outerMax={outerConfig.max}
      outerColorIndicators={outerConfig.colorIndicators}
      className={className}
    />
  );
};
