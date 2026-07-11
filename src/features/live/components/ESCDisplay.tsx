import styled from "styled-components";
import {
  CURRENT,
  INPUT,
  MeasurementName,
  RPM,
  TEMPERATURE,
  type ESC,
} from "../../../robot";
import { BarDisplay } from "./BarDisplay";
import { Container, MEDIUM_VIEWPORT, SMALL_VIEWPORT } from "../../../styles";
import { ErrorDisplay } from "./ErrorDisplay";
import { useEffect, useState } from "react";
import { METADATA } from "../../../displayUtils";
import { getDisplayMinCharacters, getLatestValue } from "../../../dataUtils";
import { MeasurementBarDisplay } from "./MeasurementBarDisplay";
import { EscConfig } from "../../configuration/configUtils";
import { MeasurementArcDisplay } from "./MeasurementArcDisplay";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const DisplayHolder = styled(Container)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
`;

const DisplayLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  gap: 4px;

  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    display: grid;
    grid-template-areas: "arc arc" "temp input";
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    display: grid;
    grid-template-areas: "arc" "temp" "input";
  }
`;

const TemperatureDisplay = styled(MeasurementBarDisplay)`
  grid-area: temp;
  ${Container} {
    background-color: unset;
  }
`;
const RPMCurrentDisplay = styled(MeasurementArcDisplay)`
  grid-area: arc;
`;

const InputDisplay = styled(BarDisplay)`
  grid-area: input;
  ${Container} {
    background-color: unset;
  }
`;
type Props = { esc: ESC; config?: EscConfig; className?: string };

export const ESCDisplay = ({ esc, config, className }: Props) => {
  const isMobileViewport = useMediaQuery(`(max-width: ${MEDIUM_VIEWPORT}px)`);
  const barOrientation = isMobileViewport ? "horizontal" : "vertical";

  if (!config) {
    return null;
  }

  const getMeasurementData = (key: MeasurementName) => ({
    measurement: esc.data.measurements[key],
    config: config.measurementConfigs[key],
  });

  const { measurement: temperature, config: temperatureConfig } =
    getMeasurementData(TEMPERATURE);
  const { measurement: rpm, config: rpmConfig } = getMeasurementData(RPM);
  const { measurement: current, config: currentConfig } =
    getMeasurementData(CURRENT);
  const inputs = esc.inputs;
  const inputsConfig = config.inputsConfig;

  return (
    <DisplayHolder className={className}>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        {temperatureConfig.shouldShow && (
          <TemperatureDisplay
            name={TEMPERATURE}
            measurement={temperature}
            config={temperatureConfig}
            orientation={barOrientation}
          />
        )}
        {rpmConfig.shouldShow && currentConfig.shouldShow && (
          <RPMCurrentDisplay
            innerName={CURRENT}
            innerMeasurement={current}
            innerConfig={currentConfig}
            outerName={RPM}
            outerMeasurement={rpm}
            outerConfig={rpmConfig}
          />
        )}

        {inputsConfig.shouldShow && (
          <InputDisplay
            name={METADATA[INPUT].displayName}
            value={getLatestValue(inputs.values)}
            unit={METADATA[INPUT].unit}
            min={inputsConfig.min}
            max={inputsConfig.max}
            colorIndicators={inputsConfig.colorIndicators}
            orientation={barOrientation}
            valueMinCharacters={getDisplayMinCharacters(
              inputsConfig.min,
              inputsConfig.max,
              METADATA[INPUT].decimals,
              METADATA[INPUT].unit,
            )}
          />
        )}
      </DisplayLayout>
      {<ErrorDisplay errors={esc.errors} />}
    </DisplayHolder>
  );
};
