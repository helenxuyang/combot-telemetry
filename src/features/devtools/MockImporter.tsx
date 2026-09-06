import { emit } from "@tauri-apps/api/event";
import { useState } from "react";
import { stringifyMessage } from "../../messageUtils";
import { ButtonsHolder } from "../../styles";
import { StyledContainer } from "./devToolsStyles";
import { useMessageQueue, useSetMessageQueue } from "./devtoolsStore";

export const MockImporter = () => {
  const messageQueue = useMessageQueue();
  const setMessageQueue = useSetMessageQueue();
  const [status, setStatus] = useState<string>("");

  const importSession = async () => {
    await emit("import-sessions", [messageQueue]);
    setMessageQueue([]);
    setStatus("SENT import-sessions event");
  };

  const clear = () => {
    setMessageQueue([]);
    setStatus("");
  };

  return (
    <StyledContainer>
      <h2>Mock import session</h2>
      <strong>Queue:</strong>
      {messageQueue.length > 0 ? (
        messageQueue.map((message) => (
          <div key={message.uuid}>{stringifyMessage(message)}</div>
        ))
      ) : (
        <span>None</span>
      )}
      <ButtonsHolder>
        <button onClick={importSession}>Import</button>
        <button onClick={clear}>Clear</button>
      </ButtonsHolder>
      <p>{status}</p>
    </StyledContainer>
  );
};
