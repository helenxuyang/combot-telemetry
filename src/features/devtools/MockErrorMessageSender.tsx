import { useState } from "react";
import { EscErrorMessage } from "../../messageTypes";
import { stringifyMessage } from "../../messageUtils";
import { ALL_ESC_IDs, EscId } from "../../robot";
import { useUpdateRobot } from "../../robotStore";
import { ButtonsHolder } from "../../styles";
import { EscSelection, InputHolder, StyledContainer } from "./devToolsStyles";
import { useQueueMessage } from "./devtoolsStore";

export const MockErrorMessageSender = () => {
  const updateRobot = useUpdateRobot();
  const queueMessage = useQueueMessage();
  const [escId, setEscId] = useState<EscId>(ALL_ESC_IDs[0]);
  const [error, setError] = useState({
    errorCode: "0",
    snr: "0",
    timestamp: "",
  });
  const [status, setStatus] = useState<string>("");

  const constructMessage = (): EscErrorMessage => ({
    messageType: "errorMessage",
    uuid: crypto.randomUUID(),
    rawMessage: "<none, mocked>",
    escId,
    errorCode: Number(error.errorCode),
    timestamp: error.timestamp ? Number(error.timestamp) : Date.now(),
    snr: Number(error.snr),
  });

  const send = () => {
    const message = constructMessage();
    updateRobot([message]);
    setStatus(`SENT: ${stringifyMessage(message, false)}`);
  };

  const updateError = (field: keyof typeof error, value: string) => {
    setError((currentError) => ({ ...currentError, [field]: value }));
  };

  return (
    <StyledContainer>
      <h2>Mock error message</h2>
      <EscSelection>
        <legend>ESC</legend>
        {ALL_ESC_IDs.map((id) => (
          <span key={id}>
            <input
              id={`error-esc-${id}`}
              type="radio"
              name="mock-error-esc-id"
              value={id}
              checked={escId === id}
              onChange={() => setEscId(id)}
            />
            <label htmlFor={`error-esc-${id}`}>{id}</label>
          </span>
        ))}
      </EscSelection>
      {Object.entries(error).map(([field, value]) => (
        <InputHolder key={field}>
          <label htmlFor={`error-input-${field}`}>{field}</label>
          <input
            id={`error-input-${field}`}
            type="number"
            value={value}
            onChange={(event) =>
              updateError(field as keyof typeof error, event.target.value)
            }
          />
        </InputHolder>
      ))}
      <ButtonsHolder>
        <button onClick={() => queueMessage(constructMessage())}>Queue</button>
        <button onClick={send}>Send</button>
      </ButtonsHolder>
      <p>{status}</p>
    </StyledContainer>
  );
};
