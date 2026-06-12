import styled from "styled-components";
import { StatusDot } from "./StatusDot";
import { ButtonsHolder } from "./styles";

type Props = {
  isRecording: boolean;
  onStart: () => void;
  onPause: () => void;
  onClear: () => void;
};

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

export const RecordingControls = ({
  isRecording,
  onStart,
  onPause,
  onClear,
}: Props) => {
  return (
    <Layout>
      <div>
        <strong>Status: </strong>
        {isRecording ? (
          <span>
            <StatusDot /> Recording
          </span>
        ) : (
          <span>Paused</span>
        )}
      </div>
      <ButtonsHolder>
        {isRecording ? (
          <button onClick={onPause}>⏸ Pause</button>
        ) : (
          <button onClick={onStart}>▶ Start</button>
        )}
        <button onClick={onClear}>🗑️ Clear </button>
      </ButtonsHolder>
    </Layout>
  );
};
