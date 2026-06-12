import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";
import { RecordingControls } from "./RecordingControls";
import { MatchControls } from "./MatchControls";
import { CSVDownloader } from "./CSVDownloader";
import { ConfigDisplay } from "./ConfigDisplay";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useIsFakeData,
  useRobot,
  useSetRobot,
  useToggleFakeData,
} from "./store";
import { getInitRobot } from "./storageUtils";
import {
  getUpdatedRobot,
  parseMessage,
  PONG_MESSAGE,
  stringifyMessage,
} from "./messageUtils";
import { FullscreenButton } from "./FullscreenButton";
import { RobotDisplay } from "./RobotDisplay";
import type {
  HandleConnectCallback,
  HandleReceiveDataCallback,
} from "./useWebSocket";
import { WebSocketConnector } from "./WebSocketConnector";
import { RawDataImporter } from "./RawDataImporter";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const HeaderHolder = styled.div`
  display: flex;

  justify-content: space-between;
`;

const ControlsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 3px solid black;
  padding: 16px;
  flex: 1;
`;

export const DashboardDisplay = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();

  const [messages, setMessages] = useState<string[]>([]);
  const robotRef = useRef(robot);
  const messagesRef = useRef<string[]>(messages);
  const pendingRobotRef = useRef<ReturnType<typeof getUpdatedRobot> | null>(
    null,
  );
  const pendingMessagesRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);
  // const renderThrottle = useRef<number>(0);
  const isFakeData = useIsFakeData();
  const toggleFakeData = useToggleFakeData();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const csvWorkerRef = useRef<Worker>(null);

  useEffect(() => {
    robotRef.current = robot;
  }, [robot]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    csvWorkerRef.current = new Worker(
      new URL("./csvWorker.js", import.meta.url),
      { type: "module" },
    );
    return () => {
      csvWorkerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const tabs: Tab[] = useMemo(
    () => [
      {
        name: "Live",
        panelContent: <RobotDisplay />,
      },
      {
        name: "Graph",
        panelContent: <GraphGrid />,
      },
      {
        name: "Config",
        panelContent: <ConfigDisplay />,
      },
    ],
    [],
  );

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handlePauseRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const handleClearRecording = useCallback(() => {
    setRobot(getInitRobot());
  }, [setRobot]);

  const handleMessage = useCallback(
    (data: string) => {
      if (!isRecording) return;
      if (data === PONG_MESSAGE) {
        return;
      }

      const parsedMessage = parseMessage(data);
      const baseRobot = pendingRobotRef.current ?? robotRef.current;
      pendingRobotRef.current = getUpdatedRobot(parsedMessage, baseRobot);
      pendingMessagesRef.current.push(stringifyMessage(parsedMessage));

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingRobotRef.current !== null) {
            setRobot(pendingRobotRef.current);
            robotRef.current = pendingRobotRef.current;
            pendingRobotRef.current = null;
          }

          const nextMessages = [
            ...messagesRef.current,
            ...pendingMessagesRef.current,
          ];
          const MESSAGES_BATCH = 50;
          if (nextMessages.length > MESSAGES_BATCH) {
            csvWorkerRef.current?.postMessage(nextMessages);
            setMessages([]);
            messagesRef.current = [];
          } else {
            setMessages(nextMessages);
            messagesRef.current = nextMessages;
          }

          pendingMessagesRef.current = [];
          rafRef.current = null;
        });
      }
    },
    [isRecording, setRobot],
  );

  // use ref so websocket doesn't re-render
  const handleMessageCallback = useRef<HandleReceiveDataCallback>(null);
  const handleConnectCallback =
    useRef<HandleConnectCallback>(handleStartRecording);

  useEffect(() => {
    handleMessageCallback.current = handleMessage;

    return () => {
      handleMessageCallback.current = null;
    };
  }, [handleMessage]);

  return (
    <Layout>
      <HeaderHolder>
        <h1>{robot.name}</h1>
        <MatchControls robot={robot} onStart={handleStartRecording} />
      </HeaderHolder>
      <NavigationTabs tabs={tabs} />
      <ControlsGrid>
        <ControlsSection>
          <h2>App Controls</h2>
          <button onClick={toggleFakeData}>
            Use {isFakeData ? "real" : "fake"} data
          </button>
          <FullscreenButton />
        </ControlsSection>
        <ControlsSection>
          <WebSocketConnector
            onReceiveData={handleMessageCallback}
            onConnect={handleConnectCallback}
          />
          Messages: {messages.length}
        </ControlsSection>
        <ControlsSection>
          <h2>Recording</h2>
          <RecordingControls
            isRecording={isRecording}
            onStart={handleStartRecording}
            onPause={handlePauseRecording}
            onClear={handleClearRecording}
          />
        </ControlsSection>
        <ControlsSection>
          <h2>Import CSV</h2>
          <RobotImporter />
          <h2>Import raw</h2>
          <RawDataImporter />
          <h2>Export CSV</h2>
          <CSVDownloader />
        </ControlsSection>
        <ControlsSection>
          <div>
            <h2>Unknown Messages</h2>
            <p>Count: {robot.unknownMessages.length}</p>
            <p>Last: {robot.unknownMessages.at(-1)?.message ?? "none"}</p>
            <details>
              <summary>All</summary>
              <p>
                {robot.unknownMessages
                  .map((unknown) => unknown.message)
                  .join(", ")}
              </p>
            </details>
          </div>
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
