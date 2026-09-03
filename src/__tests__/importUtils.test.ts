import { describe, expect, it } from "vitest";
import {
  getBookendTimestamps,
  getSessionDuration,
  getShiftedMessages,
} from "../importUtils";
import { TauriTelemetryMessage } from "../messageUtils";

const createDataMessage = (timestamp: number): TauriTelemetryMessage => ({
  messageType: "dataMessage",
  escId: "0",
  temperature: 30,
  voltage: 20,
  current: 10,
  consumption: 100,
  rpm: 1000,
  timestamp,
  input: 0,
  snr: 1,
});

describe("getBookendTimestamps", () => {
  it("gets the timestamp when the session has one message", () => {
    expect(getBookendTimestamps([createDataMessage(1000)])).toEqual({
      firstTimestamp: 1000,
      lastTimestamp: 1000,
    });
  });

  it("gets bookend timestamps from two messages out of order", () => {
    expect(
      getBookendTimestamps([createDataMessage(3000), createDataMessage(1000)]),
    ).toEqual({
      firstTimestamp: 1000,
      lastTimestamp: 3000,
    });
  });

  it("gets bookend timestamps from five messages in random order", () => {
    expect(
      getBookendTimestamps([
        createDataMessage(4000),
        createDataMessage(1000),
        createDataMessage(5000),
        createDataMessage(2000),
        createDataMessage(3000),
      ]),
    ).toEqual({
      firstTimestamp: 1000,
      lastTimestamp: 5000,
    });
  });
});

describe("getShiftedMessages", () => {
  it("shifts each timestamp relative to the first timestamp", () => {
    const session = [createDataMessage(1000), createDataMessage(2500)];

    expect(getShiftedMessages(session, 1000)).toEqual([
      createDataMessage(0),
      createDataMessage(1500),
    ]);
  });
});

describe("getSessionDuration", () => {
  it("formats the duration in minutes and seconds", () => {
    expect(getSessionDuration(1000, 121500)).toBe("2m 0s");
  });
});
