import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef } from "react";
import { TauriTelemetryMessage } from "../../../messageUtils";
import { useUpdateRobot } from "../../../store";

const GET_LATEST_MESSAGES_COMMAND = "get_latest_messages";

export const useMessageHandler = () => {
  const updateRobot = useUpdateRobot();
  const frameRef = useRef<number | null>(null);

  const handleMessage = useCallback(async () => {
    try {
      const messages = await invoke<TauriTelemetryMessage[]>(
        GET_LATEST_MESSAGES_COMMAND,
      );
      if (messages.length > 0) {
        updateRobot(messages);
      }
    } catch (error) {
      console.error("Failed to fetch latest telemetry messages", error);
    }
  }, [updateRobot]);

  useEffect(() => {
    const tick = () => {
      handleMessage();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleMessage]);
};
