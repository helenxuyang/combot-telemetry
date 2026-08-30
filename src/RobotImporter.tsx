import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { appLocalDataDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { DotsLoader } from "./DotsLoader";
import { initRobotFromConfig } from "./features/configuration/configUtils";
import { TauriTelemetryMessage } from "./messageUtils";
import { useRobot, useRobotConfig, useSetRobot, useUpdateRobot } from "./store";
import { ButtonsHolder, Container } from "./styles";

const StyledContainer = styled(Container)`
  gap: 16px;
  padding: 16px;
`;
// tell rust which file to parse
const PARSE_RAW_FILE_COMMAND = "parse_raw_file";
// rust gives array of parsed messages
const IMPORT_SESSION_EVENT = "import-session";

export const RobotImporter = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const updateRobot = useUpdateRobot();
  const config = useRobotConfig();

  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = listen<TauriTelemetryMessage[]>(
      IMPORT_SESSION_EVENT,
      (event) => {
        if (robot) {
          const messages = event.payload;
          const firstTimestamp = messages
            .filter((message) => "timestamp" in message)
            .map((message) => message.timestamp)
            .sort((a, b) => a - b)[0];

          const shiftedMessages = messages.map((message) => {
            if (firstTimestamp && "timestamp" in message) {
              return {
                ...message,
                timestamp: message.timestamp - firstTimestamp,
              };
            }
            return message;
          });

          updateRobot(shiftedMessages);
          console.log("Imported robot", robot);
        }
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

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
    </StyledContainer>
  );
};
