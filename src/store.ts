import { create } from "zustand";
import { getInitRobot } from "./storageUtils";
import { INPUT, type MatchMarker, type Robot } from "./robot";
import { immer } from "zustand/middleware/immer";
import { type ParsedMessage } from "./messageUtils";

type RobotState = {
  robot: Robot;
};

type RobotActions = {
  setRobot: (robot: RobotState["robot"]) => void;
  updateRobot: (parsedMessage: ParsedMessage) => void;
  addMatchMarker: (marker: MatchMarker) => void;
};

const useRobotStore = create<
  RobotState & RobotActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    robot: getInitRobot(),
    setRobot: (robot: Robot) =>
      set((state) => {
        state.robot = robot;
      }),
    updateRobot: (parsedMessage: ParsedMessage) =>
      set((state) => {
        const { messageType } = parsedMessage;
        const robot = state.robot;

        if (parsedMessage.messageType === "unknown") {
          robot.unknownMessages.push({
            message: parsedMessage.message,
            reason: parsedMessage.reason,
          });
          return;
        }

        const { timestamp, escName } = parsedMessage;

        // for Stack--no drive but can still get drive inputs from noise
        if (!robot.escs[escName]) {
          return;
        }

        if (robot.initialTimestamp === null) {
          robot.initialTimestamp = Date.now() - timestamp;
        }

        if (messageType === "data") {
          const { escData } = parsedMessage;
          Object.entries(escData).forEach(
            ([measurementKey, measurementValue]) => {
              const measurement =
                robot.escs[escName].measurements[measurementKey];
              measurement.values = [measurementValue];
            },
          );
          robot.escs[escName].timestamps = [timestamp];
        } else if (messageType === "input") {
          const { escData } = parsedMessage;
          robot.escs[escName].inputs.timestamps = [timestamp];
          robot.escs[escName].inputs.values = [escData[INPUT]];
        } else if (messageType === "error") {
          const { code } = parsedMessage;
          robot.escs[escName].errors.push({ code, timestamp });
        }
      }),
    addMatchMarker: (marker: MatchMarker) =>
      set((state) => {
        state.robot.matchMarkers.push(marker);
      }),
  })),
);

export const useRobot = () => useRobotStore((state) => state.robot);
export const useSetRobot = () => useRobotStore((state) => state.setRobot);
export const useUpdateRobot = () => useRobotStore((state) => state.updateRobot);
export const useAddMatchMarker = () =>
  useRobotStore((state) => state.addMatchMarker);

type AppState = {
  isFakeData: boolean;
};
type AppActions = {
  toggleFakeData: () => void;
};

const useAppStore = create<AppState & AppActions, [["zustand/immer", never]]>(
  immer((set) => ({
    isFakeData: false,
    toggleFakeData: () =>
      set((state) => {
        state.isFakeData = !state.isFakeData;
      }),
  })),
);

export const useIsFakeData = () => useAppStore((state) => state.isFakeData);
export const useToggleFakeData = () =>
  useAppStore((state) => state.toggleFakeData);
