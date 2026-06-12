import { useEffect, useRef, useState, type RefObject } from "react";
import { useIsFakeData } from "./store";

export type HandleReceiveDataCallback = (data: string) => void;
export type HandleReceiveDataCallbackRef =
  RefObject<HandleReceiveDataCallback | null>;

export type HandleConnectCallback = () => void;
export type HandleConnectCallbackRef = RefObject<HandleConnectCallback | null>;

const TELEMETRY_BOARD_IP = "192.168.4.1";

export const useWebSocket = (
  shouldAutoRetryConnection: boolean,
  onHandleReceiveData: HandleReceiveDataCallbackRef,
  onConnect: HandleConnectCallbackRef,
) => {
  const connection = useRef<WebSocket>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [closeCodes, setCloseCodes] = useState<number[]>();
  const [retryCount, setRetryCount] = useState<number>(0);

  const isFakeData = useIsFakeData();

  useEffect(() => {
    console.log("websocket setup start");
    connection.current = new WebSocket(
      // TODO: figure out how to get local IP address for fake data
      `ws://${isFakeData ? "192.168.0.129" : TELEMETRY_BOARD_IP}:81`,
      ["arduino"],
    );
    const checkStatus = setInterval(() => {
      setStatus(connection.current?.readyState ?? null);
    }, 100);

    const onOpen = () => {
      console.log("websocket open");
      connection.current?.send("Connect " + new Date());
      setStatus(connection.current?.readyState ?? null);
      clearInterval(checkStatus);
      onConnect.current?.();
    };

    connection.current.addEventListener("open", onOpen);

    const onError = (event: Event) => {
      console.log(`websocket error`, event);
      setStatus(connection.current?.readyState ?? null);
    };

    connection.current.addEventListener("error", onError);

    const onMessage = (event: MessageEvent) => {
      if (event.data === "pong") {
        console.log("websocket pong");
      } else {
        // console.log(`websocket message: ${event.data}`);
        onHandleReceiveData.current?.(event.data);
        setStatus(connection.current?.readyState ?? null);
      }
    };

    connection.current.addEventListener("message", onMessage);

    const onClose = (event: CloseEvent) => {
      console.log("websocket close", event);
      setCloseCodes((codes) => [...(codes ? codes : []), event.code]);
      setStatus(connection.current?.readyState ?? null);
      clearInterval(checkStatus);
    };

    connection.current.addEventListener("close", onClose);

    const onOffline = () => {
      console.log("offline???");
      connection.current?.close();
    };

    window.addEventListener("offline", onOffline);

    return () => {
      connection.current?.removeEventListener("open", onOpen);
      connection.current?.removeEventListener("error", onError);
      connection.current?.removeEventListener("message", onMessage);
      connection.current?.removeEventListener("close", onClose);
      window.removeEventListener("offline", onOffline);
      connection.current?.close();
      clearInterval(checkStatus);
    };
  }, [retryCount, onHandleReceiveData, onConnect, isFakeData]);

  const retryConnection = () => {
    setRetryCount((count) => {
      console.log("retrying connection");
      return count + 1;
    });
  };

  useEffect(() => {
    if (
      shouldAutoRetryConnection &&
      status === WebSocket.CLOSED &&
      (closeCodes?.at(-1) ?? null) === 1006
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      retryConnection();
    }
  }, [shouldAutoRetryConnection, closeCodes, status]);

  return { connection, status, closeCodes, retryConnection };
};
