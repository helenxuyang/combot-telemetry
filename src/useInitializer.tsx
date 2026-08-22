import { useEffect } from "react";
import {
  getCurrentConfig,
  initializeStorage,
  tauriFetchConfig,
} from "./storageUtils";
import { useSetRobot, useSetRobotConfig } from "./store";
import { initRobotFromConfig } from "./features/configuration/configUtils";

export const useInitializer = () => {
  const setRobot = useSetRobot();
  const setRobotConfig = useSetRobotConfig();

  useEffect(() => {
    const initialize = async () => {
      await initializeStorage();
      const config = await getCurrentConfig();
      if (config) {
        setRobotConfig(config);
        await tauriFetchConfig();
        setRobot(initRobotFromConfig(config));
      } else {
        setRobot(null);
      }
    };
    initialize();
  }, []);
};
