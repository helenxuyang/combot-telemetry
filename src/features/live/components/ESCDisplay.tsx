import { useRef } from "react";
import styled from "styled-components";
import { getDisplayMinCharacters, getLatestValue } from "../../../dataUtils";
import { METADATA } from "../../../displayUtils";
import {
  CURRENT,
  INPUT,
  MeasurementName,
  RPM,
  TEMPERATURE,
  type ESC,
} from "../../../robot";
import { Container, media } from "../../../styles";
import { useElementSize } from "../../../useElementSize";
import { EscConfig } from "../../configuration/configUtils";
import { useMediaQuery } from "../../useMediaQuery";
import { ArcDisplay } from "./ArcDisplay";
import { BarDisplay } from "./BarDisplay";
import { ErrorDisplay } from "./ErrorDisplay";

const StyledEscName = styled.h2`
  font-size: 24px;
`;

const DisplayHolder = styled(Container)<{ $accentColor?: string }>`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
  padding: 8px;
`;

const DisplayLayout = styled.div`
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  ${media.extraSmall} {
    flex-direction: column;
  }
`;

const StyledErrorDisplay = styled(ErrorDisplay)`
  position: absolute;
  bottom: 16px;

  ${media.small} {
    margin-top: 16px;
    position: relative;
  }
`;

type Props = {
  esc: ESC;
  config?: EscConfig;
  accentColor?: string;
  className?: string;
};

export const ESCDisplay = ({ esc, config, accentColor, className }: Props) => {
  const isLarge = useMediaQuery(`(max-width: ${500}px)`);
  const barOrientation = isLarge ? "horizontal" : "vertical";
  const ref = useRef<HTMLDivElement>(null);
  const temperatureBarRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  const { width } = useElementSize(ref);
  const temperatureBarWidth = temperatureBarRef.current?.offsetWidth ?? 0;
  const inputBarWidth = inputBarRef.current?.offsetWidth ?? 0;
  const maxArcWidth = Math.max(
    0,
    width - temperatureBarWidth - inputBarWidth - 16,
  );

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
      <StyledEscName>{esc.name}</StyledEscName>
      <DisplayLayout>
        {temperatureConfig.shouldShow && (
          <BarDisplay
            ref={temperatureBarRef}
            name={METADATA[TEMPERATURE].displayName}
            value={getLatestValue(temperature)}
            unit={METADATA[TEMPERATURE].unit}
            min={temperatureConfig.min}
            max={temperatureConfig.max}
            colorIndicators={temperatureConfig.colorIndicators}
            orientation={barOrientation}
            valueMinCharacters={largerMinimumCharacters}
            defaultColor={accentColor}
            headingLevel={3}
          />
        )}
        {rpmConfig.shouldShow && currentConfig.shouldShow && (
          <ArcDisplay
            innerName={CURRENT}
            innerValue={getLatestValue(current)}
            innerMin={currentConfig.min}
            innerMax={currentConfig.max}
            innerColorIndicators={currentConfig.colorIndicators}
            outerName={RPM}
            outerValue={getLatestValue(rpm)}
            outerMin={rpmConfig.min}
            outerMax={rpmConfig.max}
            outerColorIndicators={rpmConfig.colorIndicators}
            maxWidth={maxArcWidth}
            defaultColor={accentColor}
          />
        )}

        {inputsConfig.shouldShow && (
          <BarDisplay
            ref={inputBarRef}
            name={METADATA[INPUT].displayName}
            value={getLatestValue(inputs)}
            unit={METADATA[INPUT].unit}
            min={inputsConfig.min}
            max={inputsConfig.max}
            colorIndicators={inputsConfig.colorIndicators}
            orientation={barOrientation}
            valueMinCharacters={largerMinimumCharacters}
            defaultColor={accentColor}
            headingLevel={3}
          />
        )}
      </DisplayLayout>
      <StyledErrorDisplay errors={esc.errors} />
    </DisplayHolder>
  );
};
