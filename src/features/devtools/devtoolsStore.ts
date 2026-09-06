import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TauriTelemetryMessage } from "../../messageTypes";

type DevToolsState = {
  messageQueue: TauriTelemetryMessage[];
};

type DevToolsActions = {
  setMessageQueue: (messageQueue: TauriTelemetryMessage[]) => void;
  queueMessage: (message: TauriTelemetryMessage) => void;
};

const useDevToolsStore = create<
  DevToolsState & DevToolsActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    messageQueue: [],
    setMessageQueue: (messageQueue) =>
      set((state) => {
        state.messageQueue = messageQueue;
      }),
    queueMessage: (message) =>
      set((state) => {
        state.messageQueue.push(message);
      }),
  })),
);

export const useMessageQueue = () =>
  useDevToolsStore((state) => state.messageQueue);
export const useSetMessageQueue = () =>
  useDevToolsStore((state) => state.setMessageQueue);
export const useQueueMessage = () =>
  useDevToolsStore((state) => state.queueMessage);
