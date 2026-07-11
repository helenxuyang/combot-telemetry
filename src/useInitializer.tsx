import { useEffect } from "react";
import { getCurrentConfig, initializeStorage } from "./storageUtils";
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
        setRobot(initRobotFromConfig(config));
      } else {
        setRobotConfig(null);
        setRobot(null);
      }
    };
    initialize();
  }, []);
};
