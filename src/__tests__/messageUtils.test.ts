import { describe, expect, it } from "vitest";
import {
  EscDataMessage,
  EscErrorMessage,
  StartupMessage,
  UnknownMessage,
} from "../messageTypes";
import { stringifyMessage, stringifyMessageValues } from "../messageUtils";

const mockDataMessage: EscDataMessage = {
  messageType: "dataMessage",
  uuid: "abcd123",
  rawMessage: "<mock raw message>",
  escId: "0",
  temperature: 30,
  voltage: 20,
  current: 10,
  consumption: 100,
  rpm: 1000,
  timestamp: 1234,
  input: 1,
  snr: 2,
};

const mockErrorMessage: EscErrorMessage = {
  messageType: "errorMessage",
  uuid: "abcd123",
  rawMessage: "<mock raw message>",
  escId: "1",
  errorCode: 2,
  timestamp: 321,
  snr: 5,
};

const mockUnknownMessage: UnknownMessage = {
  messageType: "unknownMessage",
  uuid: "abcd123",
  rawMessage: "<mock unknown>",
  reason: "mock reason",
};

describe("stringifyMessageValues", () => {
  it("orders timestamp, escId, other fields, and rawMessage", () => {
    expect(stringifyMessageValues(mockDataMessage)).toBe(
      "timestamp: 1234 / escId: 0 / temperature: 30 / voltage: 20 / current: 10 / consumption: 100 / rpm: 1000 / input: 1 / snr: 2 / rawMessage: <mock raw message>",
    );
  });

  it("can omit rawMessage", () => {
    expect(stringifyMessageValues(mockDataMessage, false)).toBe(
      "timestamp: 1234 / escId: 0 / temperature: 30 / voltage: 20 / current: 10 / consumption: 100 / rpm: 1000 / input: 1 / snr: 2",
    );
  });
});

describe("stringifyMessage", () => {
  it("handles data messages", () => {
    expect(stringifyMessage(mockDataMessage, true)).toBe(
      "DATA | timestamp: 1234 / escId: 0 / temperature: 30 / voltage: 20 / current: 10 / consumption: 100 / rpm: 1000 / input: 1 / snr: 2 / rawMessage: <mock raw message>",
    );
  });

  it("handles error messages", () => {
    expect(stringifyMessage(mockErrorMessage, true)).toBe(
      "ERROR | timestamp: 321 / escId: 1 / errorCode: 2 / snr: 5 / rawMessage: <mock raw message>",
    );
  });

  it("handles unknown messages", () => {
    expect(stringifyMessage(mockUnknownMessage, true)).toBe(
      "UNKNOWN | reason: mock reason / rawMessage: <mock unknown>",
    );
  });

  it("handles startup messages", () => {
    const mockStartupMessage: StartupMessage = {
      messageType: "startupMessage",
      uuid: "abcd123",
      rawMessage: "<mock startup message>",
      snr: 3,
    };
    expect(stringifyMessage(mockStartupMessage, true)).toBe(
      "STARTUP | snr: 3 / rawMessage: <mock startup message>",
    );
  });

  it("can omit rawMessage", () => {
    expect(stringifyMessage(mockDataMessage, false)).toBe(
      "DATA | timestamp: 1234 / escId: 0 / temperature: 30 / voltage: 20 / current: 10 / consumption: 100 / rpm: 1000 / input: 1 / snr: 2",
    );
  });
});
