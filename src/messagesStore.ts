import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TauriTelemetryMessage } from "./messageTypes";

type MessagesState = {
  parsedMessages: TauriTelemetryMessage[];
};

type MessagesActions = {
  setParsedMessages: (parsedMessages: TauriTelemetryMessage[]) => void;
};

const useMessagesStore = create<
  MessagesState & MessagesActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    parsedMessages: [],
    setParsedMessages: (parsedMessages: TauriTelemetryMessage[]) =>
      set((state) => {
        state.parsedMessages = parsedMessages;
      }),
  })),
);

export const useParsedMessages = () =>
  useMessagesStore((state) => state.parsedMessages);
export const useSetParsedMessages = () =>
  useMessagesStore((state) => state.setParsedMessages);
