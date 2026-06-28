import styled from "styled-components";
import { CURRENT, INPUT, RPM, TEMPERATURE, type ESC } from "./robot";
import { BarDisplay } from "./BarDisplay";
import { ArcDisplay } from "./ArcDisplay";
import { Container, MEDIUM_VIEWPORT, SMALL_VIEWPORT } from "./styles";
import { ErrorDisplay } from "./ErrorDisplay";
import { useEffect, useState } from "react";
import { METADATA } from "./displayUtils";
import { getLatestValue } from "./dataUtils";

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

const TemperatureDisplay = styled(BarDisplay)`
  grid-area: temp;
  ${Container} {
    background-color: unset;
  }
`;
const RPMCurrentDisplay = styled(ArcDisplay)`
  grid-area: arc;
`;

const InputDisplay = styled(BarDisplay)`
  grid-area: input;
  ${Container} {
    background-color: unset;
  }
`;
type Props = { esc: ESC; className?: string };

export const ESCDisplay = ({ esc, className }: Props) => {
  const isMobileViewport = useMediaQuery(`(max-width: ${MEDIUM_VIEWPORT}px)`);
  const barOrientation = isMobileViewport ? "horizontal" : "vertical";

  const temperature = esc.data.measurements[TEMPERATURE];
  const rpm = esc.data.measurements[RPM];
  const current = esc.data.measurements[CURRENT];
  const inputs = esc.inputs;

  return (
    <DisplayHolder className={className}>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        {temperature.config.shouldShow && (
          <TemperatureDisplay
            name={METADATA[TEMPERATURE].displayName}
            unit={METADATA[TEMPERATURE].unit}
            value={getLatestValue(temperature.values)}
            config={temperature.config}
            orientation={barOrientation}
          />
        )}
        {rpm.config.shouldShow && current.config.shouldShow && (
          <RPMCurrentDisplay
            innerName={CURRENT}
            innerValue={getLatestValue(current.values)}
            innerConfig={current.config}
            outerName={RPM}
            outerValue={getLatestValue(rpm.values)}
            outerConfig={rpm.config}
          />
        )}

        {inputs.config.shouldShow && (
          <InputDisplay
            name={INPUT}
            value={getLatestValue(inputs.values)}
            unit={METADATA[INPUT].unit}
            config={inputs.config}
            orientation={barOrientation}
          />
        )}
      </DisplayLayout>
      {<ErrorDisplay errors={esc.errors} />}
    </DisplayHolder>
  );
};
