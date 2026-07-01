import { listen } from "@tauri-apps/api/event";
import { useRef, useCallback, useEffect } from "react";
import { TauriTelemetryMessage, getUpdatedRobot } from "../../../messageUtils";
import { Robot } from "../../../robot";
import { useRobot, useSetRobot } from "../../../store";

const TELEMETRY_MESSAGE_EVENT = "telemetry-message";

export const useMessageHandler = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const pendingRobotRef = useRef<Robot | null>(robot);
  const frameRef = useRef<number | null>(null);

  const handleMessage = useCallback(
    (message: TauriTelemetryMessage) => {
      // on each message, save the new robot (ref so it doesn't re-render)
      if (pendingRobotRef.current) {
        pendingRobotRef.current = getUpdatedRobot(
          message,
          pendingRobotRef.current,
        );
      } else {
        pendingRobotRef.current = robot;
      }
      // don't request another frame if we've requested already
      if (frameRef.current !== null) {
        return;
      }
      // RAF: before next repaint, update state so we re-render
      frameRef.current = requestAnimationFrame(() => {
        setRobot(pendingRobotRef.current);
        frameRef.current = null;
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
};
