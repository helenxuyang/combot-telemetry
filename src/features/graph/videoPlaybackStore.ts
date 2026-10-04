import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type SyncPoint = {
  graph: number;
  video: number;
};

type VideoPlaybackState = {
  isPlaybackActive: boolean;
  graphCurrentTime: number;
  syncPointStart: SyncPoint | null;
  syncPointEnd: SyncPoint | null;
};

type VideoPlaybackActions = {
  setIsPlaybackActive: (isPlaybackActive: boolean) => void;
  setGraphCurrentTime: (graphCurrentTime: number) => void;
  setSyncPointStart: (syncPoint: SyncPoint | null) => void;
  setSyncPointEnd: (syncPoint: SyncPoint | null) => void;
};

const useVideoPlaybackStore = create<
  VideoPlaybackState & VideoPlaybackActions,
  [["zustand/immer", never]]
>(
  immer((set) => ({
    isPlaybackActive: false,
    graphCurrentTime: 0,
    syncPointStart: null, // { graph: 49.27, video: 60.71 },
    syncPointEnd: null, // { graph: 305.29, video: 314.3 },
    setIsPlaybackActive: (isPlaybackActive) =>
      set((state) => {
        state.isPlaybackActive = isPlaybackActive;
      }),
    setGraphCurrentTime: (graphCurrentTime) =>
      set((state) => {
        state.graphCurrentTime = graphCurrentTime;
      }),
    setSyncPointStart: (syncPoint) =>
      set((state) => {
        state.syncPointStart = syncPoint;
      }),
    setSyncPointEnd: (syncPoint) =>
      set((state) => {
        state.syncPointEnd = syncPoint;
      }),
  })),
);

export const useIsPlaybackActive = () =>
  useVideoPlaybackStore((state) => state.isPlaybackActive);
export const useGraphCurrentTime = () =>
  useVideoPlaybackStore((state) => state.graphCurrentTime);
export const useSyncPointStart = () =>
  useVideoPlaybackStore((state) => state.syncPointStart);
export const useSyncPointEnd = () =>
  useVideoPlaybackStore((state) => state.syncPointEnd);
export const useSetIsPlaybackActive = () =>
  useVideoPlaybackStore((state) => state.setIsPlaybackActive);
export const useSetGraphCurrentTime = () =>
  useVideoPlaybackStore((state) => state.setGraphCurrentTime);
export const useSetSyncPointStart = () =>
  useVideoPlaybackStore((state) => state.setSyncPointStart);
export const useSetSyncPointEnd = () =>
  useVideoPlaybackStore((state) => state.setSyncPointEnd);
