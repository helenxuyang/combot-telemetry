import { invoke } from "@tauri-apps/api/core";
import {
  BaseDirectory,
  create,
  exists,
  mkdir,
  readDir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { RobotConfig } from "./features/configuration/configUtils";
import { useSetRobotConfig } from "./robotStore";

export const baseDir = BaseDirectory.AppLocalData;
const CONFIGS_DIRECTORY = "configs";
const SETTINGS = "settings.json";

const FETCH_CURRENT_CONFIG_COMMAND = "fetch_current_config";

type Settings = {
  configName: string | null;
  isMockData: boolean;
};

const initializeSettingsFile = async () => {
  const settings = await exists(SETTINGS, {
    baseDir,
  });
  if (!settings) {
    const file = await create(SETTINGS, {
      baseDir,
    });
    const initSettings: Settings = {
      configName: null,
      isMockData: false,
    };
    await file.write(new TextEncoder().encode(JSON.stringify(initSettings)));
  }
};

const initializeConfigsDirectory = async () => {
  const configDirectory = await exists(CONFIGS_DIRECTORY, {
    baseDir,
  });
  if (!configDirectory) {
    await mkdir(CONFIGS_DIRECTORY, {
      baseDir,
      recursive: true,
    });
  }
};

export const initializeStorage = async () => {
  await initializeSettingsFile();
  await initializeConfigsDirectory();
};

const getSettings = async () => {
  const contents = await readTextFile(SETTINGS, {
    baseDir,
  });
  const settings: Settings = JSON.parse(contents);
  return settings;
};

const saveSettings = async (settings: Settings) => {
  const contents = JSON.stringify(settings);
  await writeTextFile(SETTINGS, contents, {
    baseDir,
  });
};

const getConfigName = (robotName: string) => {
  return robotName.toLocaleLowerCase().replaceAll(" ", "-");
};

const getConfigPath = (configName: string) => {
  return `${CONFIGS_DIRECTORY}/${configName}.json`;
};

export const getConfig = async (
  configName: string,
): Promise<RobotConfig | null> => {
  const contents = await readTextFile(getConfigPath(configName), {
    baseDir,
  });
  try {
    const config: RobotConfig = JSON.parse(contents);
    return config;
  } catch (e) {
    console.log(`Error when trying to get config ${configName}: ${e}`);
  }
  return null;
};

export const tauriFetchConfig = async () => {
  try {
    await invoke(FETCH_CURRENT_CONFIG_COMMAND);
  } catch (err) {
    console.log(`RUST ERROR: ${err}`);
  }
};

export const getAllConfigNames = async () => {
  const entries = await readDir(CONFIGS_DIRECTORY, {
    baseDir,
  });
  return entries.map((entry) => entry.name.replace(".json", ""));
};

export const getCurrentConfigName = async () => {
  const { configName } = await getSettings();
  return configName;
};

export const getCurrentConfig = async () => {
  const configName = await getCurrentConfigName();
  if (!configName) {
    return null;
  }
  const config = await getConfig(configName);
  return config;
};

export const useStorageUtils = () => {
  const setConfig = useSetRobotConfig();

  const saveConfig = async (robotConfig: RobotConfig) => {
    const contents = JSON.stringify(robotConfig);
    const slugifiedName = getConfigName(robotConfig.name);
    const fileName = getConfigPath(slugifiedName);
    await writeTextFile(fileName, contents, {
      baseDir,
      create: true,
    });
    setConfig(robotConfig);
  };

  const selectConfig = async (robotName: string | null) => {
    const prevSettings = await getSettings();
    const newSettings = {
      ...prevSettings,
      configName: robotName ? getConfigName(robotName) : null,
    };
    await saveSettings(newSettings);
    await tauriFetchConfig();
    if (robotName) {
      const config = await getCurrentConfig();
      setConfig(config);
    } else {
      setConfig(null);
    }
  };

  const deleteCurrentConfig = async () => {
    const currentConfigName = await getCurrentConfigName();
    if (currentConfigName) {
      await remove(getConfigPath(currentConfigName), { baseDir });
      await selectConfig(null);
    }
  };

  const importConfig = async (config: RobotConfig) => {
    await saveConfig(config);
    await selectConfig(config.name);
  };

  return { saveConfig, selectConfig, deleteCurrentConfig, importConfig };
};
