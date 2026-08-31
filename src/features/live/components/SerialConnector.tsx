import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ButtonsHolder, Container, WarningText } from "../../../styles";
import { SignalStrengthDisplay } from "./SignalStrengthDisplay";
import { UnknownMessagesDisplay } from "./UnknownMessagesDisplay";
import { useMessageHandler } from "./useMessageHandler";

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
  flex: 1;
`;

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

  useMessageHandler();

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
      <SignalStrengthDisplay />
      {port ? (
        <>
          <h3>Port</h3>
          <p>{port}</p>
          <button onClick={stopListening}>Stop listening</button>
        </>
      ) : (
        <PortInfoHolder>
          <h3>Ports</h3>
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
      {error && <WarningText>Error: {error}</WarningText>}
      <UnknownMessagesDisplay />
    </StyledContainer>
  );
};
