import { invoke } from "@tauri-apps/api/core";
import { useMessageHandler } from "./useMessageHandler";

const WEBSOCKET_CONNECT_COMMAND = "websocket_connect";

export const TauriWebSocketConnector = () => {
  useMessageHandler();
  const invokeWebSocketConnect = async () => {
    await invoke(WEBSOCKET_CONNECT_COMMAND);
  };

  return <button onClick={invokeWebSocketConnect}>Connect</button>;
};
