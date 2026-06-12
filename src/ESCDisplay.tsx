import styled from "styled-components";
import { CURRENT, RPM, TEMPERATURE, type ESC } from "./robot";
import { BarDisplay } from "./BarDisplay";
import { ArcDisplay } from "./ArcDisplay";
import { Container, MEDIUM_VIEWPORT, SMALL_VIEWPORT } from "./styles";
import { ErrorDisplay } from "./ErrorDisplay";
import { useEffect, useRef, useState } from "react";
import beepAudio from "./assets/beep.wav";

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

const TempDisplay = styled(BarDisplay)`
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
type Props = { esc?: ESC; className?: string; shouldPlayRPMAlert?: boolean };

export const ESCDisplay = ({ esc, className, shouldPlayRPMAlert }: Props) => {
  const isMobileViewport = useMediaQuery(`(max-width: ${MEDIUM_VIEWPORT}px)`);
  const barOrientation = isMobileViewport ? "horizontal" : "vertical";
  const rpmAlertAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!esc) {
      return;
    }
    const rpm = esc.measurements[RPM];
    if (!rpm || !rpm.highlightThreshold) {
      return;
    }
    const rpmValue = rpm.values.at(-1) ?? 0;
    if (rpmValue >= rpm.highlightThreshold) {
      rpmAlertAudioRef.current?.play();
    } else {
      rpmAlertAudioRef.current?.pause();
    }
  }, [esc]);

  if (!esc) {
    return null;
  }

  return (
    <DisplayHolder className={className}>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        {esc.measurements[TEMPERATURE].shouldShow && (
          <TempDisplay
            measurement={esc.measurements[TEMPERATURE]}
            orientation={barOrientation}
          />
        )}
        {esc.measurements[RPM].shouldShow &&
          esc.measurements[CURRENT].shouldShow && (
            <RPMCurrentDisplay
              outerMeasurement={esc.measurements[RPM]}
              innerMeasurement={esc.measurements[CURRENT]}
            />
          )}
        {esc.measurements[RPM].shouldShow && shouldPlayRPMAlert && (
          <audio ref={rpmAlertAudioRef} src={beepAudio} autoPlay loop></audio>
        )}
        {esc.inputs.shouldShow && (
          <InputDisplay measurement={esc.inputs} orientation={barOrientation} />
        )}
      </DisplayLayout>
      {<ErrorDisplay errors={esc.errors} />}
    </DisplayHolder>
  );
};
