import { TauriTelemetryMessage } from "./messageTypes";

export const getBookendTimestamps = (session: TauriTelemetryMessage[]) => {
  let firstTimestamp: number | undefined;
  let lastTimestamp: number | undefined;

  for (const message of session) {
    if ("timestamp" in message) {
      firstTimestamp = Math.min(
        firstTimestamp ?? message.timestamp,
        message.timestamp,
      );
      lastTimestamp = Math.max(
        lastTimestamp ?? message.timestamp,
        message.timestamp,
      );
    }
  }

  return { firstTimestamp, lastTimestamp };
};

// shift messages so first timestamp is 0
// assumes first is indeed the first
// TODO: better error handling
export const getShiftedMessages = (
  session: TauriTelemetryMessage[],
  firstTimestamp: number,
) => {
  const shiftedMessages = session.map((message) => {
    if (firstTimestamp && "timestamp" in message) {
      return {
        ...message,
        timestamp: message.timestamp - firstTimestamp,
      };
    }
    return message;
  });
  return shiftedMessages;
};

// assumes first <= last
// TODO: better error handling
export const getSessionDuration = (
  firstTimestamp: number,
  lastTimestamp: number,
) => {
  const durationSec = (lastTimestamp - firstTimestamp) / 1000;
  const durationMin = durationSec / 60;
  const formattedMin = Math.floor(durationMin);
  const formattedSec = Math.floor(durationSec) % 60;
  return `${formattedMin}m ${formattedSec}s`;
};
