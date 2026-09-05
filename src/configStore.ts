import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

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
