import { useRef, useState } from "react";
import { ButtonsHolder } from "./styles";
import styled from "styled-components";
import type { Robot } from "./robot";
import { useAddMatchMarker } from "./store";

type FightStatus = "INACTIVE" | "FIGHTING" | "PAUSED";

const MatchControlsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MATCH_LENGTH = 180;

type Props = {
  robot: Robot;
  onStart: () => void;
};
export const MatchControls = ({ robot, onStart }: Props) => {
  const [fightStatus, setFightStatus] = useState<FightStatus>("INACTIVE");
  const [matchTimeSec, setMatchTimeSec] = useState<number>(MATCH_LENGTH);
  const timerRef = useRef<number>(null);

  const addMatchMarker = useAddMatchMarker();

  const min = Math.floor(matchTimeSec / 60);
  const sec = matchTimeSec % 60;
  const time = `${min}:${sec < 10 ? "0" : ""}${sec}`;

  const setTimer = () => {
    timerRef.current = setInterval(() => {
      setMatchTimeSec((sec) => sec - 1);
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const getCurrentTimestamp = () => {
    return Date.now() - (robot.initialTimestamp ?? 0);
  };

  const handleStart = (isResume: boolean = false) => {
    addMatchMarker({
      type: isResume ? "RESUME" : "START",
      timestamp: getCurrentTimestamp(),
    });
    setFightStatus("FIGHTING");
    setTimer();
    onStart();
  };

  const handlePause = () => {
    addMatchMarker({
      type: "PAUSE",
      timestamp: getCurrentTimestamp(),
    });
    setFightStatus("PAUSED");
    clearTimer();
  };

  const handleEnd = () => {
    addMatchMarker({
      type: "END",
      timestamp: getCurrentTimestamp(),
    });
    setFightStatus("INACTIVE");
    clearTimer();
    setMatchTimeSec(MATCH_LENGTH);
  };

  const startButton = <button onClick={() => handleStart()}>▶</button>;
  const resumeButton = <button onClick={() => handleStart(true)}>▶</button>;
  const pauseButton = <button onClick={handlePause}>⏸</button>;
  const endButton = <button onClick={handleEnd}>⏹</button>;

  const getButtons = () => {
    switch (fightStatus) {
      case "INACTIVE":
        return startButton;
      case "FIGHTING":
        return (
          <ButtonsHolder>
            {pauseButton}
            {endButton}
          </ButtonsHolder>
        );
      case "PAUSED":
        return (
          <ButtonsHolder>
            {resumeButton}
            {endButton}
          </ButtonsHolder>
        );
    }
  };

  return (
    <MatchControlsSection>
      <strong>Time left:</strong> <span>{time}</span>
      {getButtons()}
    </MatchControlsSection>
  );
};
