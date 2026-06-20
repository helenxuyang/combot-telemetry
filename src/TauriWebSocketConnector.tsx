import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { getUpdatedRobot, TauriTelemetryMessage } from "./messageUtils";
import { Robot } from "./robot";
import { useRobot, useSetRobot } from "./store";

const WEBSOCKET_CONNECT_COMMAND = "websocket_connect";
const TELEMETRY_MESSAGE_EVENT = "telemetry-message";

export const TauriWebSocketConnector = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const pendingRobotRef = useRef<Robot>(robot);
  const frameRef = useRef<number | null>(null);

  const handleMessage = useCallback((message: TauriTelemetryMessage) => {
    // on each message, save the new robot (ref so it doesn't re-render)
    pendingRobotRef.current = getUpdatedRobot(message, pendingRobotRef.current);
    // don't request another frame if we've requested already
    if (frameRef.current !== null) {
      return;
    }
    // RAF: before next repaint, update state so we re-render
    frameRef.current = requestAnimationFrame(() => {
      setRobot(pendingRobotRef.current);
      frameRef.current = null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const invokeWebSocketConnect = () => {
    invoke(WEBSOCKET_CONNECT_COMMAND);
  };

  useEffect(() => {
    const unlisten = listen<TauriTelemetryMessage>(
      TELEMETRY_MESSAGE_EVENT,
      (event) => {
        handleMessage(event.payload);
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return <button onClick={invokeWebSocketConnect}>Connect</button>;
};
