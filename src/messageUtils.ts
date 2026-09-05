import {
  EscDataMessage,
  EscErrorMessage,
  StartupMessage,
  TauriTelemetryMessage,
  UnknownMessage,
} from "./messageTypes";

const priorityByKey: Record<string, number> = {
  timestamp: 0,
  escId: 1,
  rawMessage: 3,
};

export const stringifyMessageValues = (
  message: TauriTelemetryMessage,
  includeRaw: boolean = true,
) => {
  return (
    Object.keys(message) as Array<
      | keyof StartupMessage
      | keyof EscDataMessage
      | keyof EscErrorMessage
      | keyof UnknownMessage
    >
  )
    .filter((key) => {
      let include = true;
      if (!includeRaw) {
        include = include && key !== "rawMessage";
      }
      include = include && key !== "uuid" && key !== "messageType";
      return include;
    })
    .sort(
      (key1, key2) => (priorityByKey[key1] ?? 2) - (priorityByKey[key2] ?? 2),
    )
    .map((key) => `${key}: ${message[key as keyof typeof message]}`)
    .join(" / ");
};

export const stringifyMessage = (
  message: TauriTelemetryMessage,
  showRaw: boolean = true,
) => {
  const { messageType } = message;
  return `${messageType.substring(0, messageType.indexOf("Message")).toUpperCase()} | ${stringifyMessageValues(message, showRaw)}`;
};
