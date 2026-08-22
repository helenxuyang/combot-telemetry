import styled from "styled-components";
import {
  CURRENT,
  INPUT,
  MeasurementName,
  RPM,
  TEMPERATURE,
  type ESC,
} from "../../../robot";
import { Container, MEDIUM_VIEWPORT, SMALL_VIEWPORT } from "../../../styles";
import { ErrorDisplay } from "./ErrorDisplay";
import { useEffect, useState } from "react";
import { METADATA } from "../../../displayUtils";
import { getDisplayMinCharacters } from "../../../dataUtils";
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

const DisplayHolder = styled(Container)<{ $accentColor?: string }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
  ${(props) => props.$accentColor && `border: 4px solid ${props.$accentColor}`};
  padding: 8px;
`;

const DisplayLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;

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
`;
const RPMCurrentDisplay = styled(MeasurementArcDisplay)`
  grid-area: arc;
`;

const InputDisplay = styled(MeasurementBarDisplay)`
  grid-area: input;
`;

type Props = {
  esc: ESC;
  config?: EscConfig;
  accentColor?: string;
  className?: string;
};

export const ESCDisplay = ({ esc, config, accentColor, className }: Props) => {
  const isMobileViewport = useMediaQuery(`(max-width: ${MEDIUM_VIEWPORT}px)`);
  const barOrientation = isMobileViewport ? "horizontal" : "vertical";

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
    <DisplayHolder className={className} $accentColor={accentColor}>
      <h2>{esc.name}</h2>
      <DisplayLayout>
        {temperatureConfig.shouldShow && (
          <TemperatureDisplay
            name={TEMPERATURE}
            values={temperature}
            config={temperatureConfig}
            orientation={barOrientation}
            minimumCharacters={largerMinimumCharacters}
          />
        )}
        {rpmConfig.shouldShow && currentConfig.shouldShow && (
          <RPMCurrentDisplay
            innerName={CURRENT}
            innerValues={current}
            innerConfig={currentConfig}
            outerName={RPM}
            outerValues={rpm}
            outerConfig={rpmConfig}
          />
        )}

        {inputsConfig.shouldShow && (
          <InputDisplay
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
