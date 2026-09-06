import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { TauriTelemetryMessage } from "../../messageTypes";
import { stringifyMessage } from "../../messageUtils";
import { useUpdateRobot } from "../../robotStore";
import { RawMessageInput, StyledContainer } from "./devToolsStyles";

export const MockRawMessageSender = () => {
  const updateRobot = useUpdateRobot();
  const [rawMessage, setRawMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const send = async () => {
    try {
      const parsedMessage = await invoke<TauriTelemetryMessage>(
        "parse_message",
        { rawMessage },
      );
      setStatus(`PARSED: ${stringifyMessage(parsedMessage, false)}`);
      updateRobot([parsedMessage]);
    } catch (error) {
      setStatus(`FAILED TO PARSE: ${error}`);
    }
  };

  return (
    <StyledContainer>
      <h2>Mock raw message</h2>
      <RawMessageInput
        value={rawMessage}
        onChange={(event) => setRawMessage(event.target.value)}
      />
      <button onClick={send}>Send</button>
      <p>{status}</p>
    </StyledContainer>
  );
};
