import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useMessageHandler } from "./useMessageHandler";
import { ButtonsHolder, HorizontalContainer } from "../../../styles";

const GET_SERIAL_PORTS = "get_serial_ports";
const READ_SERIAL_COMMAND = "read_serial";
const STOP_SERIAL_COMMAND = "stop_serial";

type PortInfo = {
  name: string;
  product: string | null;
};

const getPortDisplayName = (port: PortInfo) => {
  return `${port.name}: ${port.product}`;
};

export const SerialConnector = () => {
  const [allPorts, setAllPorts] = useState<PortInfo[]>([]);
  const [port, setPort] = useState<PortInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAllPorts = async () => {
    const ports = await invoke<PortInfo[]>(GET_SERIAL_PORTS);
    setAllPorts(ports);
  };

  useEffect(() => {
    getAllPorts();
  }, []);

  useMessageHandler();

  const startListening = async (port: PortInfo) => {
    try {
      setError(null);
      await invoke(READ_SERIAL_COMMAND, { port: port.name });
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
    <HorizontalContainer>
      <h2>Serial</h2>

      {port ? (
        <>
          <i>{getPortDisplayName(port)}</i>
          <button onClick={stopListening}>Stop listening</button>
        </>
      ) : (
        <div>
          <ButtonsHolder>
            {allPorts?.map((port) => (
              <button onClick={() => startListening(port)}>
                {getPortDisplayName(port)}
              </button>
            ))}
            <button onClick={getAllPorts}>Refresh</button>
          </ButtonsHolder>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </HorizontalContainer>
  );
};
