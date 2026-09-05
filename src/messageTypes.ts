import { EscId } from "./robot";

export type StartupMessage = {
  messageType: "startupMessage";
  uuid: string;
  rawMessage: string;
  snr: number;
};

export type EscDataMessage = {
  messageType: "dataMessage";
  uuid: string;
  rawMessage: string;
  escId: EscId;
  temperature: number;
  voltage: number;
  current: number;
  consumption: number;
  rpm: number;
  timestamp: number;
  input: number;
  snr: number;
};

export type EscErrorMessage = {
  messageType: "errorMessage";
  uuid: string;
  rawMessage: string;
  escId: EscId;
  errorCode: number;
  timestamp: number;
  snr: number;
};

export type UnknownMessage = {
  messageType: "unknownMessage";
  uuid: string;
  rawMessage: string;
  reason: string;
};

export type TauriTelemetryMessage =
  | StartupMessage
  | EscDataMessage
  | EscErrorMessage
  | UnknownMessage;
