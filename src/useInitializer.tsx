import { useEffect } from "react";
import {
  getCurrentConfig,
  initializeStorage,
  tauriFetchConfig,
} from "./storageUtils";
import { useSetRobot } from "./store";
import { initRobotFromConfig } from "./features/configuration/configUtils";

export const useInitializer = () => {
  const setRobot = useSetRobot();

  useEffect(() => {
    const initialize = async () => {
      await initializeStorage();
      const config = await getCurrentConfig();
      if (config) {
        await tauriFetchConfig();
        setRobot(initRobotFromConfig(config));
      } else {
        setRobot(null);
      }
    };
    initialize();
  }, []);
};
