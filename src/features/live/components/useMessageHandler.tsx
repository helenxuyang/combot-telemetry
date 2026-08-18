import { listen } from "@tauri-apps/api/event";
import { useRef, useCallback, useEffect, useState } from "react";
import { TauriTelemetryMessage, getUpdatedRobot } from "../../../messageUtils";
import { Robot } from "../../../robot";
import { useRobot, useSetRobot } from "../../../store";

const TELEMETRY_MESSAGE_EVENT = "telemetry-message";

export const useMessageHandler = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const robotRef = useRef<Robot>(robot);
  const frameRef = useRef<number | null>(null);

  const handleMessage = useCallback(
    (messages: TauriTelemetryMessage[]) => {
      // don't request another frame if we've requested already
      if (frameRef.current !== null) {
        return;
      }
      // RAF: before next repaint, update state so we re-render
      frameRef.current = requestAnimationFrame(() => {
        if (robotRef.current) {
          for (const message of messages) {
            robotRef.current = getUpdatedRobot(message, robotRef.current);
          }
          setRobot(robotRef.current);
          frameRef.current = null;
        }
      });
    },
    [setRobot],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const unlisten = listen<TauriTelemetryMessage[]>(
      TELEMETRY_MESSAGE_EVENT,
      (event) => {
        handleMessage(event.payload);
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);
};
