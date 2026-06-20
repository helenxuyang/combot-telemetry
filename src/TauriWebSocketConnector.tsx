import { invoke } from "@tauri-apps/api/core";

export const TauriWebSocketConnector = () => {
  const invokeWebSocketConnect = () => {
    invoke("websocket_connect");
  };

  return <button onClick={invokeWebSocketConnect}>Connect</button>;
};
