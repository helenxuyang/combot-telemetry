import { useState } from "react";
import {
  useWebSocket,
  type HandleConnectCallbackRef,
  type HandleReceiveDataCallbackRef,
} from "./useWebSocket";
import styled from "styled-components";

const Status = styled.p`
  font-size: 40px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  onReceiveData: HandleReceiveDataCallbackRef;
  onConnect: HandleConnectCallbackRef;
};

type WebSocketStatus = 0 | 1 | 2 | 3;
const connectionMap: Record<WebSocketStatus, string> = {
  [WebSocket.CONNECTING]: "👀 Connecting",
  [WebSocket.OPEN]: "✅ Open",
  [WebSocket.CLOSING]: "⚠️ Closing",
  [WebSocket.CLOSED]: "❌ Closed",
};

export const WebSocketConnector = ({ onReceiveData, onConnect }: Props) => {
  const [shouldAutoRetryConnection, setShouldAutoRetryConnection] =
    useState<boolean>(true);

  const { connection, status, closeCodes, retryConnection } = useWebSocket(
    shouldAutoRetryConnection,
    onReceiveData,
    onConnect,
  );

  const closeConnection = () => {
    connection.current?.close();
  };

  return (
    <div>
      <h2>Connection</h2>
      <Status>
        {status === null ? "none" : connectionMap[status as WebSocketStatus]}
      </Status>
      <p># close codes: {closeCodes?.length}</p>
      <Controls>
        {status === WebSocket.OPEN && (
          <button onClick={closeConnection}>Close connection</button>
        )}
        <label>
          <input
            type="checkbox"
            checked={shouldAutoRetryConnection}
            onChange={(event) =>
              setShouldAutoRetryConnection(event.target.checked)
            }
          />
          Auto retry connection
        </label>
        {status === WebSocket.CLOSED && (
          <button onClick={retryConnection}>Retry connection</button>
        )}
        <button
          onClick={() => {
            connection.current?.send("ping");
          }}
        >
          Send ping
        </button>
      </Controls>
    </div>
  );
};
