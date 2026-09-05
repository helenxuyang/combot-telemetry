import { current } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  initRobotFromConfig,
  RobotConfig,
} from "./features/configuration/configUtils";
import { TauriTelemetryMessage } from "./messageTypes";
import { MeasurementName, type MatchMarker, type Robot } from "./robot";

type RobotState = {
  robot: Robot | null;
  robotConfig: RobotConfig | null;
};

type RobotActions = {
  setRobot: (robot: RobotState["robot"]) => void;
  clearRobot: () => void;
  updateRobot: (
    message: TauriTelemetryMessage[],
    options?: { replace: boolean },
  ) => void;
  setRobotConfig: (robotConfig: RobotConfig | null) => void;
  addMatchMarker: (marker: MatchMarker) => void;
};

const useRobotStore = create<
  RobotState & RobotActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    robot: null,
    robotConfig: null,
    clearRobot: () =>
      set((state) => {
        const config = current(state.robotConfig);
        if (config) {
          state.robot = initRobotFromConfig(config);
        }
      }),
    setRobot: (robot: Robot | null) =>
      set((state) => {
        state.robot = robot;
      }),
    updateRobot: (
      messages: TauriTelemetryMessage[],
      options: { replace: boolean } = { replace: true },
    ) =>
      set((state) => {
        if (state.robot) {
          for (let message of messages) {
            const { messageType } = message;
            if (message.messageType === "unknownMessage") {
              state.robot.unknownMessages.push({
                rawMessage: message.rawMessage,
              });
            } else if (message.messageType !== "startupMessage") {
              const { timestamp, escId } = message;
              const esc = state.robot.escs[escId];
              if (!esc) {
                return;
              }

              if (state.robot.initialTimestamp === null) {
                state.robot.initialTimestamp = Date.now() - timestamp;
              }

              if (messageType === "errorMessage") {
                const { errorCode, snr } = message;
                esc.errors.push({ errorCode, timestamp, signalStrength: snr });
              } else if (messageType === "dataMessage") {
                const {
                  messageType,
                  rawMessage,
                  escId,
                  timestamp,
                  snr,
                  uuid,
                  ...escData
                } = message;
                if (options.replace) {
                  esc.timestamps = [timestamp];
                } else {
                  esc.timestamps.push(timestamp);
                }
                (
                  Object.entries(escData) as [MeasurementName, number][]
                ).forEach(([measurementKey, measurementValue]) => {
                  if (options.replace) {
                    esc.data[measurementKey] = [measurementValue];
                  } else {
                    esc.data[measurementKey].push(measurementValue);
                  }
                });
                const signalStrength = {
                  value: snr,
                  timestamp,
                };
                if (options.replace) {
                  state.robot.signalStrengths = [signalStrength];
                } else {
                  state.robot.signalStrengths.push(signalStrength);
                }
              }
            }
          }
        }
      }),
    setRobotConfig: (robotConfig: RobotConfig | null) =>
      set((state) => {
        state.robotConfig = robotConfig;
      }),
    addMatchMarker: (marker: MatchMarker) =>
      set((state) => {
        state.robot?.matchMarkers.push(marker);
      }),
  })),
);

export const useRobot = () => useRobotStore((state) => state.robot);
export const useRobotConfig = () => useRobotStore((state) => state.robotConfig);
export const useClearRobot = () => useRobotStore((state) => state.clearRobot);
export const useSetRobot = () => useRobotStore((state) => state.setRobot);
export const useUpdateRobot = () => useRobotStore((state) => state.updateRobot);
export const useSetRobotConfig = () =>
  useRobotStore((state) => state.setRobotConfig);
export const useAddMatchMarker = () =>
  useRobotStore((state) => state.addMatchMarker);
