import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useMessageHandler } from "./useMessageHandler";
import { ButtonsHolder } from "../../../styles";

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
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getAllPorts = async () => {
      const ports = await invoke<PortInfo[]>(GET_SERIAL_PORTS);
      setAllPorts(ports);
    };
    getAllPorts();
  }, []);

  useMessageHandler();

  const startListening = async (port: PortInfo) => {
    try {
      await invoke(READ_SERIAL_COMMAND, { port: port.name });
      setPort(port);
    } catch (e) {
      setError(String(e));
      setPort(null);
    }
  };

  const stopListening = async () => {
    await invoke(STOP_SERIAL_COMMAND);
    setPort(null);
  };

  return (
    <div>
      <h2>Serial Connection</h2>

      {port ? (
        <>
          <h3>Current Port</h3>
          <p>{getPortDisplayName(port)}</p>
          <button onClick={stopListening}>Stop listening</button>
        </>
      ) : (
        <div>
          <h3>Ports</h3>
          <ButtonsHolder>
            {allPorts?.map((port) => (
              <button onClick={() => startListening(port)}>
                {getPortDisplayName(port)}
              </button>
            ))}
          </ButtonsHolder>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};
