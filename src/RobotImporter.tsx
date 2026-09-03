import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { appLocalDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DotsLoader } from "./DotsLoader";
import {
  getBookendTimestamps,
  getSessionDuration,
  getShiftedMessages,
} from "./importUtils";
import { TauriTelemetryMessage } from "./messageUtils";
import {
  useClearRobot,
  useRobot,
  useRobotConfig,
  useUpdateRobot,
} from "./store";
import {
  ButtonsHolder,
  CondensedButton,
  Container,
  media,
  SelectableCondensedButton,
} from "./styles";

const Holder = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  ${media.extraSmall} {
    flex-direction: column;
  }
`;

const FileContainer = styled(Container)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const SessionsContainer = styled(Container)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

// tell rust which file to parse
const PARSE_RAW_FILE_COMMAND = "parse_raw_file";
// rust gives array of sessions (arrays of parsed messages)
const IMPORT_SESSIONS_EVENT = "import-sessions";

type Session = {
  messages: TauriTelemetryMessage[];
  firstTimestamp: number;
  duration: string;
};

export const RobotImporter = () => {
  const robot = useRobot();
  const clearRobot = useClearRobot();
  const updateRobot = useUpdateRobot();
  const config = useRobotConfig();

  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<
    number | null
  >(null);

  const positionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unlisten = listen<TauriTelemetryMessage[][]>(
      IMPORT_SESSIONS_EVENT,
      (event) => {
        setSessions([]);
        setSelectedSessionIndex(null);
        clearRobot();

        if (robot) {
          const sessions = event.payload;
          for (let session of sessions) {
            const { firstTimestamp, lastTimestamp } =
              getBookendTimestamps(session);
            const shiftedMessages = getShiftedMessages(session, firstTimestamp);

            setSessions((sessions) => [
              ...sessions,
              {
                messages: shiftedMessages,
                firstTimestamp,
                duration: getSessionDuration(firstTimestamp, lastTimestamp),
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

  // if only 1 session, auto-select
  useEffect(() => {
    if (sessions.length === 1) {
      handleSelectSession(0);
    }
  }, [sessions]);

  const handleSelectSession = (index: number) => {
    setSelectedSessionIndex(index);
    const session = sessions[index];
    clearRobot();
    updateRobot(session.messages, { replace: false });
    console.log("Imported robot", robot);
    scrollToPosition();
  };

  const scrollToPosition = () => {
    if (positionRef.current) {
      const rect = positionRef.current.getBoundingClientRect();
      window.scrollTo({
        left: 0,
        top: rect.top + window.scrollY - 2,
        behavior: "smooth",
      });
    }
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
      setFile(selectedFile.substring(selectedFile.lastIndexOf("\\") + 1));
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    if (config) {
      setFile(null);
      setSessions([]);
      setSelectedSessionIndex(null);
      clearRobot();
    }
  };

  return (
    <Holder ref={positionRef}>
      <FileContainer>
        {!file && <strong>Import: </strong>}
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
              <CondensedButton onClick={handleSelectFile}>
                Select
              </CondensedButton>
            ))}
          {file && (
            <CondensedButton onClick={handleClearSelection}>
              Clear
            </CondensedButton>
          )}
        </ButtonsHolder>
      </FileContainer>
      {sessions.length > 0 && (
        <SessionsContainer>
          <strong>Sessions:</strong>
          {sessions.map((session, index) => (
            <SelectableCondensedButton
              $isSelected={index === selectedSessionIndex}
              onClick={() => handleSelectSession(index)}
            >
              {`(${index + 1}) ${session.duration}`}
            </SelectableCondensedButton>
          ))}
        </SessionsContainer>
      )}
    </Holder>
  );
};
