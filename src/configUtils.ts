import {
  ALL_MEASUREMENTS,
  CONSUMPTION,
  CURRENT,
  ESC,
  EscId,
  MeasurementConfig,
  Robot,
  RPM,
  RpmMeasurementConfig,
  TEMPERATURE,
  VOLTAGE,
} from "./robot";
import {
  writeTextFile,
  readTextFile,
  copyFile,
  BaseDirectory,
  exists,
  create,
  mkdir,
  readDir,
} from "@tauri-apps/plugin-fs";

export type RobotConfig = {
  name: string;
  escConfigs: Partial<Record<EscId, EscConfig>>;
};

export type EscConfig = {
  name: string;
  measurementConfigs: {
    [TEMPERATURE]: MeasurementConfig;
    [VOLTAGE]: MeasurementConfig;
    [CURRENT]: MeasurementConfig;
    [CONSUMPTION]: MeasurementConfig;
    [RPM]: RpmMeasurementConfig;
  };
  inputConfig: MeasurementConfig;
};

export const getNewRobotConfig = (): RobotConfig => {
  return {
    name: "",
    escConfigs: {
      a: getNewEscConfig(),
    },
  };
};

export const getNewEscConfig = (): EscConfig => {
  return {
    name: "",
    measurementConfigs: {
      [TEMPERATURE]: {
        min: 0,
        max: 0,
        thresholds: [],
        shouldShow: true,
      },
      [VOLTAGE]: {
        min: 0,
        max: 0,
        thresholds: [],
        shouldShow: true,
      },
      [CURRENT]: {
        min: 0,
        max: 0,
        thresholds: [],
        shouldShow: true,
      },
      [CONSUMPTION]: {
        min: 0,
        max: 0,
        thresholds: [],
        shouldShow: true,
      },
      [RPM]: {
        min: 0,
        max: 0,
        thresholds: [],
        shouldShow: true,
        gearRatio: 1,
        motorPolePairs: 7,
      },
    },
    inputConfig: {
      min: -100,
      max: 100,
      thresholds: [],
      shouldShow: true,
    },
  };
};

export const getInitRobot = async () => {
  const config = await getCurrentRobotConfig();
  const robot = initRobotFromConfig(config);
  return { robot, config };
};

export const initRobotFromConfig = (robotConfig: RobotConfig): Robot => {
  let escMap: Robot["escs"] = {};

  Object.entries(robotConfig.escConfigs).forEach(([escId, escConfig]) => {
    escMap[escId as EscId] = {
      name: escConfig.name,
      data: {
        timestamps: [],
        measurements: ALL_MEASUREMENTS.reduce(
          (acc, measurement) => {
            acc[measurement] = {
              config: escConfig.measurementConfigs[measurement],
              values: [],
            };
            return acc;
          },
          {} as ESC["data"]["measurements"],
        ),
      },
      inputs: {
        timestamps: [],
        values: [],
        config: {
          min: -100,
          max: 100,
          thresholds: [],
          shouldShow: escConfig.inputConfig.shouldShow,
        },
      },
      errors: [],
    };
  });

  return {
    name: robotConfig.name,
    escs: escMap,
    unknownMessages: [],
    initialTimestamp: null,
    matchMarkers: [],
  };
};

const CONFIGS_DIRECTORY = "configs";
const CURRENT_CONFIG_FILE_NAME = "current_config.json";

export const initializeConfigStorage = async () => {
  const configDirectory = await exists(CONFIGS_DIRECTORY, {
    baseDir: BaseDirectory.AppLocalData,
  });
  if (!configDirectory) {
    await mkdir(CONFIGS_DIRECTORY, {
      baseDir: BaseDirectory.AppLocalData,
      recursive: true,
    });
    console.log("created AppLocalData dir");
  }

  const doesConfigExist = await exists(getCurrentConfigPath(), {
    baseDir: BaseDirectory.AppLocalData,
  });
  if (!doesConfigExist) {
    const file = await create(getCurrentConfigPath(), {
      baseDir: BaseDirectory.AppLocalData,
    });
    await file.write(
      new TextEncoder().encode(JSON.stringify(getNewRobotConfig())),
    );
    await file.close();
    console.log("created current config");
  }
};

export const slugify = (robotName: string) => {
  return robotName.toLocaleLowerCase().replaceAll(" ", "-");
};

export const saveRobotConfig = async (robotConfig: RobotConfig) => {
  const contents = JSON.stringify(robotConfig);
  const fileName = `${CONFIGS_DIRECTORY}/${slugify(robotConfig.name)}.json`;
  await writeTextFile(fileName, contents, {
    baseDir: BaseDirectory.AppLocalData,
    create: true,
  });
};

export const getCurrentConfigPath = () => {
  return `${CONFIGS_DIRECTORY}/${CURRENT_CONFIG_FILE_NAME}`;
};

export const getConfigPath = (name: string) => {
  return `${CONFIGS_DIRECTORY}/${name}.json`;
};

export const selectConfig = async (name: string) => {
  await copyFile(getConfigPath(name), getCurrentConfigPath(), {
    fromPathBaseDir: BaseDirectory.AppLocalData,
    toPathBaseDir: BaseDirectory.AppLocalData,
  });
};

export const getCurrentRobotConfig = async (): Promise<RobotConfig> => {
  await initializeConfigStorage();

  const contents = await readTextFile(getCurrentConfigPath(), {
    baseDir: BaseDirectory.AppLocalData,
  });
  const config = JSON.parse(contents);
  console.log("current config:", config);
  return config;
};

export const getAllConfigNames = async () => {
  const entries = await readDir(CONFIGS_DIRECTORY, {
    baseDir: BaseDirectory.AppLocalData,
  });
  return entries
    .map((entry) => entry.name)
    .filter((entry) => entry !== CURRENT_CONFIG_FILE_NAME)
    .map((entry) => entry.replace(".json", ""));
};
