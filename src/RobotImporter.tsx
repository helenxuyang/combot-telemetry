import { open } from "@tauri-apps/plugin-dialog";
import { useRobot, useRobotConfig, useSetRobot } from "./store";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { getUpdatedRobot, TauriTelemetryMessage } from "./messageUtils";
import { ButtonsHolder } from "./styles";
import { initRobotFromConfig } from "./features/configuration/configUtils";

// tell rust which file to parse
const PARSE_RAW_FILE_COMMAND = "parse_raw_file";
// rust gives array of parsed messages
const IMPORT_SESSION_EVENT = "import-session";

export const RobotImporter = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const config = useRobotConfig();

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
            .sort()[0];

          let newRobot = structuredClone(robot);
          for (let message of messages) {
            let updatedMessage;
            if (firstTimestamp && "timestamp" in message) {
              const shiftedTimestamp = message.timestamp - firstTimestamp;
              updatedMessage = { ...message, timestamp: shiftedTimestamp };
            } else {
              updatedMessage = message;
            }

            newRobot = getUpdatedRobot(updatedMessage, newRobot, {
              shouldReplace: false,
              shouldCopy: false,
            });
          }
          setRobot(newRobot);
          console.log("Imported robot", newRobot);
        }
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleSelectFile = async () => {
    const selectedFile = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Robot CSV",
          extensions: ["txt"],
        },
      ],
    });
    if (selectedFile) {
      await invoke(PARSE_RAW_FILE_COMMAND, { rawFileName: selectedFile });
      setFile(selectedFile);
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
    <>
      <h2>Import</h2>
      {file && (
        <p>
          <strong>Current: </strong>
          {file}
        </p>
      )}
      <ButtonsHolder>
        <button onClick={handleSelectFile}>Select CSV</button>
        {file && (
          <button onClick={handleClearSelection}>Clear selection</button>
        )}
      </ButtonsHolder>
    </>
  );
};
