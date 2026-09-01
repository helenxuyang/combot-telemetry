import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { appLocalDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { DotsLoader } from "./DotsLoader";
import { initRobotFromConfig } from "./features/configuration/configUtils";
import { TauriTelemetryMessage } from "./messageUtils";
import {
  useClearRobot,
  useRobot,
  useRobotConfig,
  useSetRobot,
  useUpdateRobot,
} from "./store";
import { ButtonsHolder, Container } from "./styles";

const StyledContainer = styled(Container)`
  gap: 16px;
  padding: 16px;
`;

const SessionButton = styled.button<{ $isSelected: boolean }>`
  ${({ $isSelected }) => $isSelected && " text-decoration: underline;"};
`;

// tell rust which file to parse
const PARSE_RAW_FILE_COMMAND = "parse_raw_file";
// rust gives array of sessions (arrays of parsed messages)
const IMPORT_SESSIONS_EVENT = "import-sessions";

type Session = {
  messages: TauriTelemetryMessage[];
  firstTimestamp: number;
  duration: number;
};

export const RobotImporter = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const clearRobot = useClearRobot();
  const updateRobot = useUpdateRobot();
  const config = useRobotConfig();

  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const unlisten = listen<TauriTelemetryMessage[][]>(
      IMPORT_SESSIONS_EVENT,
      (event) => {
        setSessions([]);
        if (robot) {
          const sessions = event.payload;
          for (let session of sessions) {
            const sortedTimestamps = session
              .filter((message) => "timestamp" in message)
              .map((message) => message.timestamp)
              .sort((a, b) => a - b);
            // shift messages so first timestamp is 0
            const firstTimestamp = sortedTimestamps[0];
            const lastTimestamp = sortedTimestamps[sortedTimestamps.length - 1];
            const durationMin = (lastTimestamp - firstTimestamp) / 1000 / 60;
            const roundedDurationMin = Number(durationMin.toFixed(2));

            const shiftedMessages = session.map((message) => {
              if (firstTimestamp && "timestamp" in message) {
                return {
                  ...message,
                  timestamp: message.timestamp - firstTimestamp,
                };
              }
              return message;
            });

            setSessions((sessions) => [
              ...sessions,
              {
                messages: shiftedMessages,
                firstTimestamp,
                duration: roundedDurationMin,
              },
            ]);
          }
        }
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleSelectSession = (index: number) => {
    setSelectedSessionIndex(index);
    const session = sessions[index];
    clearRobot();
    updateRobot(session.messages, { replace: false });
    console.log("Imported robot", robot);
  };

  const handleSelectFile = async () => {
    const defaultPath = await appLocalDataDir();
    const selectedFile = await open({
      multiple: false,
      directory: false,
      defaultPath,
      filters: [
        {
          name: "Robot CSV",
          extensions: ["txt"],
        },
      ],
    });
    if (selectedFile) {
      setLoading(true);
      await invoke(PARSE_RAW_FILE_COMMAND, { rawFileName: selectedFile });
      setFile(selectedFile);
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    if (config) {
      const emptyRobot = initRobotFromConfig(config);
      setRobot(emptyRobot);
      setFile(null);
      setSessions([]);
    }
  };

  return (
    <StyledContainer>
      <h2>Import</h2>
      {file && (
        <p>
          <strong>Current: </strong>
          {file}
        </p>
      )}
      <ButtonsHolder>
        {!file &&
          (loading ? (
            <DotsLoader />
          ) : (
            <button onClick={handleSelectFile}>Select CSV</button>
          ))}
        {file && (
          <button onClick={handleClearSelection}>Clear selection</button>
        )}
      </ButtonsHolder>

      {sessions && (
        <>
          <h3>Sessions</h3>
          <ButtonsHolder>
            {sessions.map((session, index) => (
              <SessionButton
                $isSelected={index === selectedSessionIndex}
                onClick={() => handleSelectSession(index)}
              >{`Session ${index + 1}: ${session.duration}min`}</SessionButton>
            ))}
          </ButtonsHolder>
        </>
      )}
    </StyledContainer>
  );
};
