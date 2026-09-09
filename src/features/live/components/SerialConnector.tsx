import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ButtonsHolder, Container, WarningText } from "../../../styles";
import { SignalStrengthContainer } from "./SignalStrengthContainer";
import { UnknownMessagesDisplay } from "./UnknownMessagesDisplay";
import { RadioStatus, useMessageHandler } from "./useMessageHandler";

const GET_SERIAL_PORTS = "get_serial_ports";
const READ_SERIAL_COMMAND = "read_serial";
const STOP_SERIAL_COMMAND = "stop_serial";

const StyledContainer = styled(Container)`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PortInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const Status = styled.strong<{ $color: string }>`
  font-size: 24px;
  color: ${({ $color }) => $color};
`;

const StopButton = styled.button`
  width: fit-content;
`;

const radioStatusColors: Record<RadioStatus, string> = {
  INACTIVE: "red",
  WAITING: "goldenrod",
  ACTIVE: "green",
};

export const SerialConnector = () => {
  const [allPorts, setAllPorts] = useState<string[]>([]);
  const [port, setPort] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const getAllPorts = async () => {
    const ports = await invoke<string[]>(GET_SERIAL_PORTS);
    setAllPorts(ports);
  };

  useEffect(() => {
    getAllPorts();

    return () => {
      stopListening();
    };
  }, []);

  const status = useMessageHandler(port !== null);

  const startListening = async (port: string) => {
    try {
      setError(null);
      await invoke(READ_SERIAL_COMMAND, { port });
      setPort(port);
    } catch (e) {
      setError(String(e));
      setPort(null);
    }
  };

  const stopListening = async () => {
    setError(null);
    await invoke(STOP_SERIAL_COMMAND);
    setPort(null);
  };

  return (
    <StyledContainer ref={ref}>
      <h2>Serial</h2>
      <SignalStrengthContainer />
      {port ? (
        <PortInfoHolder>
          <Status $color="green">PORT: {port}</Status>
          <StopButton onClick={stopListening}>Stop listening</StopButton>
        </PortInfoHolder>
      ) : (
        <PortInfoHolder>
          <Status $color="red">PORT: NONE</Status>
          <strong>Select port:</strong>
          <ButtonsHolder>
            {allPorts?.map((port) => (
              <button key={port} onClick={() => startListening(port)}>
                {port}
              </button>
            ))}
            <button onClick={getAllPorts}>Refresh</button>
          </ButtonsHolder>
        </PortInfoHolder>
      )}
      <Status $color={radioStatusColors[status]}>RADIO: {status}</Status>
      {error && <WarningText>Error: {error}</WarningText>}
      <UnknownMessagesDisplay />
    </StyledContainer>
  );
};
