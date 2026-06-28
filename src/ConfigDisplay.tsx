import { useEffect, useState } from "react";
import {
  getAllConfigNames,
  getConfigPath,
  getCurrentRobotConfig,
  RobotConfig,
  selectConfig,
} from "./configUtils";
import { useRobotConfig, useSetRobotConfig } from "./store";

export const ConfigDisplay = () => {
  const config = useRobotConfig();
  const setConfig = useSetRobotConfig();
  const [configNames, setConfigNames] = useState<string[]>([]);

  console.log("config display", config);

  useEffect(() => {
    const getConfigs = async () => {
      const configs = await getAllConfigNames();
      setConfigNames(configs);
    };
    getConfigs();
  }, []);

  return (
    <div>
      <h2>Current config:</h2>
      {JSON.stringify(config)}
      <h2>All configs:</h2>
      {configNames.map((name) => (
        <button
          key={name}
          onClick={async () => {
            await selectConfig(name);
            const newConfig = await getCurrentRobotConfig();
            setConfig(newConfig);
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
};
