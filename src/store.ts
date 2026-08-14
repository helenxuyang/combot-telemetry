import { create } from "zustand";
import { type MatchMarker, type Robot } from "./robot";
import { immer } from "zustand/middleware/immer";
import { RobotConfig } from "./features/configuration/configUtils";

type RobotState = {
  robot: Robot | null;
  robotConfig: RobotConfig | null;
};

type RobotActions = {
  setRobot: (robot: RobotState["robot"]) => void;
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
    setRobot: (robot: Robot | null) =>
      set((state) => {
        state.robot = robot;
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
export const useSetRobot = () => useRobotStore((state) => state.setRobot);
export const useSetRobotConfig = () =>
  useRobotStore((state) => state.setRobotConfig);
export const useAddMatchMarker = () =>
  useRobotStore((state) => state.addMatchMarker);

type LiveState = {
  isFakeData: boolean;
};
type LiveActions = {
  toggleFakeData: () => void;
};

const useLiveStore = create<
  LiveState & LiveActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    isFakeData: false,
    toggleFakeData: () =>
      set((state) => {
        state.isFakeData = !state.isFakeData;
      }),
  })),
);

export const useIsFakeData = () => useLiveStore((state) => state.isFakeData);
export const useToggleFakeData = () =>
  useLiveStore((state) => state.toggleFakeData);

type ConfigState = {
  isEditing: boolean;
};
type ConfigActions = {
  setIsEditing: (isEditing: boolean) => void;
};

const useConfigStore = create<
  ConfigState & ConfigActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    isEditing: false,
    setIsEditing: (isEditing: boolean) =>
      set((state) => {
        state.isEditing = isEditing;
      }),
  })),
);

export const useIsEditing = () => useConfigStore((state) => state.isEditing);
export const useSetIsEditing = () =>
  useConfigStore((state) => state.setIsEditing);
