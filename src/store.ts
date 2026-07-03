import { create } from "zustand";
import { type MatchMarker, type Robot } from "./robot";
import { immer } from "zustand/middleware/immer";
import {
  initRobotFromConfig,
  RobotConfig,
} from "./features/configuration/configUtils";

type RobotState = {
  robot: Robot | null;
  robotConfig: RobotConfig | null;
};

type RobotActions = {
  setRobot: (robot: RobotState["robot"]) => void;
  setRobotConfig: (robotConfig: RobotConfig) => void;
  addMatchMarker: (marker: MatchMarker) => void;
};

const useRobotStore = create<
  RobotState & RobotActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    robot: null,
    robotConfig: null,
    setRobot: (robot: Robot | null) =>
      set((state) => {
        state.robot = robot;
      }),
    setRobotConfig: (robotConfig: RobotConfig) =>
      set((state) => {
        state.robotConfig = robotConfig;
        state.robot = initRobotFromConfig(robotConfig);
      }),
    addMatchMarker: (marker: MatchMarker) =>
      set((state) => {
        state.robot?.matchMarkers.push(marker);
      }),
  })),
);

export const useRobot = () => useRobotStore((state) => state.robot);
export const useRobotConfig = () => useRobotStore((state) => state.robotConfig);
export const useSetRobot = () => useRobotStore((state) => state.setRobot);
export const useSetRobotConfig = () =>
  useRobotStore((state) => state.setRobotConfig);
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
