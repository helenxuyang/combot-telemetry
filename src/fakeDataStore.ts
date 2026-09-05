import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type FakeDataState = {
  isFakeData: boolean;
};

type FakeDataActions = {
  toggleFakeData: () => void;
};

const useFakeDataStore = create<
  FakeDataState & FakeDataActions,
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

export const useIsFakeData = () =>
  useFakeDataStore((state) => state.isFakeData);
export const useToggleFakeData = () =>
  useFakeDataStore((state) => state.toggleFakeData);
