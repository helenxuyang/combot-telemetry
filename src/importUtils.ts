import { TauriTelemetryMessage } from "./messageUtils";

export const getBookendTimestamps = (session: TauriTelemetryMessage[]) => {
  const sortedTimestamps = session
    .filter((message) => "timestamp" in message)
    .map((message) => message.timestamp)
    .sort((a, b) => a - b);
  const firstTimestamp = sortedTimestamps[0];
  const lastTimestamp =
    sortedTimestamps.length === 1
      ? firstTimestamp
      : sortedTimestamps[sortedTimestamps.length - 1];
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
