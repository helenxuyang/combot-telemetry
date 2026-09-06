import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { TauriTelemetryMessage } from "../../../messageTypes";
import { useUpdateRobot } from "../../../robotStore";

const GET_LATEST_MESSAGES_COMMAND = "get_latest_messages";

export type RadioStatus = "INACTIVE" | "WAITING" | "ACTIVE";

export const useMessageHandler = (isPortConnected: boolean) => {
  const updateRobot = useUpdateRobot();
  const frameRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);
  const [status, setStatus] = useState<RadioStatus>("INACTIVE");

  const handleMessage = useCallback(async () => {
    try {
      const messages = await invoke<TauriTelemetryMessage[]>(
        GET_LATEST_MESSAGES_COMMAND,
      );
      if (isPortConnected && messages.length > 0) {
        updateRobot(messages);
        lastTimestamp.current = performance.now();
        setStatus("ACTIVE");
      }
    } catch (error) {
      console.error("Failed to fetch latest telemetry messages", error);
    }
  }, [updateRobot, isPortConnected]);

  useEffect(() => {
    const tick = () => {
      handleMessage();
      if (lastTimestamp.current !== null) {
        const msSinceLastMessage = performance.now() - lastTimestamp.current;
        if (msSinceLastMessage >= 1000) {
          setStatus("INACTIVE");
        } else if (msSinceLastMessage >= 100) {
          setStatus("WAITING");
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    if (isPortConnected) {
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      setStatus("INACTIVE");
      lastTimestamp.current = null;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleMessage, isPortConnected]);

  return status;
};
