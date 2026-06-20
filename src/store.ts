import { create } from "zustand";
import { getInitRobot } from "./storageUtils";
import { type MatchMarker, type Robot } from "./robot";
import { immer } from "zustand/middleware/immer";

type RobotState = {
  robot: Robot;
};

type RobotActions = {
  setRobot: (robot: RobotState["robot"]) => void;
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
    addMatchMarker: (marker: MatchMarker) =>
      set((state) => {
        state.robot.matchMarkers.push(marker);
      }),
  })),
);

export const useRobot = () => useRobotStore((state) => state.robot);
export const useSetRobot = () => useRobotStore((state) => state.setRobot);
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
