import { open } from "@tauri-apps/plugin-dialog";
import { useRobot, useSetRobot } from "./store";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { getUpdatedRobot, TauriTelemetryMessage } from "./messageUtils";

// tell rust which file to parse
const PARSE_RAW_FILE_COMMAND = "parse_raw_file";
// rust gives array of parsed messages
const IMPORT_SESSION_EVENT = "import-session";

export const RobotImporter = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();

  useEffect(() => {
    const unlisten = listen<TauriTelemetryMessage[]>(
      IMPORT_SESSION_EVENT,
      (event) => {
        if (robot) {
          const messages = event.payload;
          let newRobot = structuredClone(robot);
          for (let message of messages) {
            newRobot = getUpdatedRobot(message, newRobot, {
              shouldReplace: false,
              shouldCopy: false,
            });
          }
          setRobot(newRobot);
        }
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleSelectFile = async () => {
    const file = await open({
      multiple: false,
      directory: false,
    });
    if (file) {
      await invoke(PARSE_RAW_FILE_COMMAND, { rawFileName: file });
    }
  };

  return (
    <>
      <h2>Import CSV</h2>
      <button onClick={handleSelectFile}>Select CSV</button>
    </>
  );
};
