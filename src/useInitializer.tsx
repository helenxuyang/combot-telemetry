import { useEffect } from "react";
import { initRobotFromConfig } from "./features/configuration/configUtils";
import { useSetRobot, useSetRobotConfig } from "./robotStore";
import {
  getCurrentConfig,
  initializeStorage,
  tauriFetchConfig,
} from "./storageUtils";

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
