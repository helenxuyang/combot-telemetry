import { useState } from "react";
import { EscDataMessage } from "../../messageTypes";
import { stringifyMessage } from "../../messageUtils";
import { ALL_ESC_IDs, EscId } from "../../robot";
import { useUpdateRobot } from "../../robotStore";
import { ButtonsHolder } from "../../styles";
import { EscSelection, InputHolder, StyledContainer } from "./devToolsStyles";
import { useQueueMessage } from "./devtoolsStore";

export const MockDataMessageSender = () => {
  const updateRobot = useUpdateRobot();
  const queueMessage = useQueueMessage();
  const [escId, setEscId] = useState<EscId>(ALL_ESC_IDs[0]);
  const [data, setData] = useState({
    temperature: "0",
    voltage: "0",
    current: "0",
    consumption: "0",
    rpm: "0",
    input: "0",
    snr: "0",
    timestamp: "",
  });
  const [status, setStatus] = useState<string>("");

  const constructMessage = (): EscDataMessage => ({
    messageType: "dataMessage",
    uuid: crypto.randomUUID(),
    rawMessage: "<none, mocked>",
    escId,
    temperature: Number(data.temperature),
    voltage: Number(data.voltage),
    current: Number(data.current),
    consumption: Number(data.consumption),
    rpm: Number(data.rpm),
    timestamp: data.timestamp ? Number(data.timestamp) : Date.now(),
    input: Number(data.input),
    snr: Number(data.snr),
  });

  const send = () => {
    const message = constructMessage();
    updateRobot([message]);
    setStatus(`SENT: ${stringifyMessage(message, false)}`);
  };

  const updateData = (field: keyof typeof data, value: string) => {
    setData((currentData) => ({ ...currentData, [field]: value }));
  };

  return (
    <StyledContainer>
      <h2>Mock data message</h2>
      <EscSelection>
        <legend>ESC</legend>
        {ALL_ESC_IDs.map((id) => (
          <span key={id}>
            <input
              id={`esc-${id}`}
              type="radio"
              name="mock-esc-id"
              value={id}
              checked={escId === id}
              onChange={() => setEscId(id)}
            />
            <label htmlFor={`esc-${id}`}>{id}</label>
          </span>
        ))}
      </EscSelection>
      {Object.entries(data).map(([field, value]) => (
        <InputHolder key={field}>
          <label htmlFor={`input-${field}`}>{field}</label>
          <input
            id={`input-${field}`}
            type="number"
            value={value}
            onChange={(event) =>
              updateData(field as keyof typeof data, event.target.value)
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
