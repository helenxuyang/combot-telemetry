import styled from "styled-components";
import {
  CURRENT,
  INPUT,
  MeasurementName,
  RPM,
  TEMPERATURE,
  type ESC,
} from "../../../robot";
import { Container, EXTRA_SMALL_VIEWPORT } from "../../../styles";
import { ErrorDisplay } from "./ErrorDisplay";
import { useRef } from "react";
import { METADATA } from "../../../displayUtils";
import { getDisplayMinCharacters } from "../../../dataUtils";
import { MeasurementBarDisplay } from "./MeasurementBarDisplay";
import { EscConfig } from "../../configuration/configUtils";
import { MeasurementArcDisplay } from "./MeasurementArcDisplay";
import { useElementSize } from "../../../useElementSize";
import { useMediaQuery } from "../../useMediaQuery";

const DisplayHolder = styled(Container)<{ $accentColor?: string }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
  padding: 8px;
`;

const DisplayLayout = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${EXTRA_SMALL_VIEWPORT}px) {
    flex-direction: column;
  }
`;

type Props = {
  esc: ESC;
  config?: EscConfig;
  accentColor?: string;
  className?: string;
};

export const ESCDisplay = ({ esc, config, accentColor, className }: Props) => {
  const isLarge = useMediaQuery(`(max-width: ${EXTRA_SMALL_VIEWPORT}px)`);
  const barOrientation = isLarge ? "horizontal" : "vertical";
  const ref = useRef<HTMLDivElement>(null);

  const { width, height } = useElementSize(ref);
  const maxArcWidth = width * 0.6;
  const maxArcHeight = height;

  if (!config) {
    return null;
  }

  const getMeasurementData = (key: MeasurementName) => ({
    measurement: esc.data[key],
    config: config.measurementConfigs[key],
  });

  const { measurement: temperature, config: temperatureConfig } =
    getMeasurementData(TEMPERATURE);
  const { measurement: rpm, config: rpmConfig } = getMeasurementData(RPM);
  const { measurement: current, config: currentConfig } =
    getMeasurementData(CURRENT);
  const { measurement: inputs, config: inputsConfig } =
    getMeasurementData(INPUT);

  // keeps the display symmetrical
  const largerMinimumCharacters = Math.max(
    getDisplayMinCharacters(
      temperatureConfig.min,
      temperatureConfig.max,
      METADATA[TEMPERATURE].decimals,
      METADATA[TEMPERATURE].unit,
    ),
    getDisplayMinCharacters(
      inputsConfig.min,
      inputsConfig.max,
      METADATA[INPUT].decimals,
      METADATA[INPUT].unit,
    ),
  );

  return (
    <DisplayHolder ref={ref} className={className} $accentColor={accentColor}>
      <h2>{esc.name}</h2>
      <DisplayLayout>
        {temperatureConfig.shouldShow && (
          <MeasurementBarDisplay
            name={TEMPERATURE}
            values={temperature}
            config={temperatureConfig}
            orientation={barOrientation}
            minimumCharacters={largerMinimumCharacters}
          />
        )}
        {rpmConfig.shouldShow && currentConfig.shouldShow && (
          <MeasurementArcDisplay
            innerName={CURRENT}
            innerValues={current}
            innerConfig={currentConfig}
            outerName={RPM}
            outerValues={rpm}
            outerConfig={rpmConfig}
            maxWidth={maxArcWidth}
            maxHeight={maxArcHeight}
          />
        )}

        {inputsConfig.shouldShow && (
          <MeasurementBarDisplay
            name={INPUT}
            values={inputs}
            config={inputsConfig}
            orientation={barOrientation}
            minimumCharacters={largerMinimumCharacters}
          />
        )}
      </DisplayLayout>
      {<ErrorDisplay errors={esc.errors} />}
    </DisplayHolder>
  );
};
