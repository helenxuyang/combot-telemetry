import {
  ARM_ESC,
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  INPUT,
  RPM,
  TEMPERATURE,
  UNITS,
  VOLTAGE,
  WEAPON_ESC,
  type ESC,
  type EscName,
  type Measurement,
  type MeasurementName,
  type Robot,
} from "./robot";

export type MeasurementConfig = {
  name: MeasurementName;
  min: number;
  max: number;
  colorThresholds?: Record<string, number>;
  highlightThreshold?: number;
  shouldShow: boolean;
};

type EscConfig = {
  name: EscName;
  measurementConfigs: Record<MeasurementName, MeasurementConfig>;
};

export type RobotConfig = {
  name: string;
  escConfigs: Record<EscName, EscConfig>;
};

const initMeasurementFromConfig = (config: MeasurementConfig): Measurement => {
  const { name, min, max, colorThresholds, highlightThreshold, shouldShow } =
    config;
  return {
    name,
    min,
    max,
    colorThresholds,
    highlightThreshold,
    unit: UNITS[config.name as keyof typeof UNITS] ?? "",
    values: [],
    shouldShow,
  };
};

const getDefaultMeasurementConfigs = (): Record<
  MeasurementName,
  MeasurementConfig
> => {
  return {
    [TEMPERATURE]: {
      name: TEMPERATURE,
      min: 25,
      max: 100,
      shouldShow: true,
      colorThresholds: {
        gold: 68,
        orange: 75,
        red: 85,
      },
    },
    [VOLTAGE]: { name: VOLTAGE, min: 16, max: 26, shouldShow: true },
    [CURRENT]: { name: CURRENT, min: 0, max: 100, shouldShow: true },
    [CONSUMPTION]: { name: CONSUMPTION, min: 0, max: 3000, shouldShow: false },
    [RPM]: {
      name: RPM,
      min: 0,
      max: 20000,
      shouldShow: true,
    },
  };
};

const getMeasurementConfigs = (
  overrideConfigs?: Partial<
    Record<MeasurementName, Partial<MeasurementConfig>>
  >,
): Record<MeasurementName, MeasurementConfig> => {
  const defaults = getDefaultMeasurementConfigs();
  const configs = Object.fromEntries(
    Object.entries(defaults).map(([key, defaultConfig]) => [
      [key as MeasurementName],
      {
        ...defaultConfig,
        ...(overrideConfigs ? overrideConfigs[key as MeasurementName] : {}),
      },
    ]),
  );
  return configs;
};

const initEscFromConfig = (escConfig: EscConfig): ESC => {
  const { name, measurementConfigs: measurementConfigs } = escConfig;
  return {
    name,
    measurements: Object.fromEntries(
      Object.entries(measurementConfigs).map(([name, config]) => [
        name,
        initMeasurementFromConfig(config),
      ]),
    ),
    abbreviation: name
      .split("")
      .filter((char) => char.toUpperCase() === char)
      .join(""),
    timestamps: [],
    inputs: {
      name: INPUT,
      unit: "",
      min: -100,
      max: 100,
      values: [],
      timestamps: [],
      shouldShow: true,
    },
    errors: [],
  };
};

const getConfigFromEsc = (esc: ESC): EscConfig => {
  return {
    name: esc.name,
    measurementConfigs: Object.fromEntries(
      Object.entries(esc.measurements).map(([key, config]) => {
        const { min, max, colorThresholds, highlightThreshold, shouldShow } =
          config;
        return [
          [key],
          {
            name: key,
            min,
            max,
            colorThresholds,
            highlightThreshold,
            shouldShow,
          },
        ];
      }),
    ),
  };
};

export const initRobotFromConfig = (robotConfig: RobotConfig): Robot => {
  const { name, escConfigs } = robotConfig;
  return {
    name,
    escs: Object.fromEntries(
      Object.entries(escConfigs).map(([name, config]) => [
        name,
        initEscFromConfig(config),
      ]),
    ),
    initialTimestamp: null,
    matchMarkers: [],
    unknownMessages: [],
  };
};

export const getConfigFromRobot = (robot: Robot): RobotConfig => {
  const config: RobotConfig = {
    name: robot.name,
    escConfigs: Object.fromEntries(
      Object.entries(robot.escs).map(([key, esc]) => [
        [key],
        getConfigFromEsc(esc),
      ]),
    ),
  };
  return config;
};

const COLOSSAL_AVIAN = "Colossal Avian";

export const getDefaultColossalAvianConfig = (): RobotConfig => ({
  name: COLOSSAL_AVIAN,
  escConfigs: {
    [DRIVE_LEFT_ESC]: {
      name: DRIVE_LEFT_ESC,
      measurementConfigs: getMeasurementConfigs(),
    },
    [DRIVE_RIGHT_ESC]: {
      name: DRIVE_RIGHT_ESC,
      measurementConfigs: getMeasurementConfigs(),
    },
    [WEAPON_ESC]: {
      name: WEAPON_ESC,
      measurementConfigs: getMeasurementConfigs({
        [RPM]: { max: 35000, highlightThreshold: 20000 },
      }),
    },
    [ARM_ESC]: {
      name: ARM_ESC,
      measurementConfigs: getMeasurementConfigs({
        [RPM]: { shouldShow: false },
        [VOLTAGE]: { shouldShow: false },
        [CURRENT]: { shouldShow: false },
        [CONSUMPTION]: { shouldShow: false },
        [TEMPERATURE]: { shouldShow: false },
      }),
    },
  },
});

export const getInitColossalAvian = () =>
  initRobotFromConfig(getDefaultColossalAvianConfig());

const STACK_OVERFLOW = "Stack Overflow";

const getDefaultStackOverflowConfig = (): RobotConfig => ({
  name: STACK_OVERFLOW,
  escConfigs: {
    [WEAPON_ESC]: {
      name: WEAPON_ESC,
      measurementConfigs: getMeasurementConfigs({
        [RPM]: { max: 18000, highlightThreshold: 18000 * 0.8 },
        [CURRENT]: { max: 80 },
        [VOLTAGE]: {
          min: 0,
          max: 17.4,
        },
        [CONSUMPTION]: {
          max: 850,
        },
      }),
    },
  },
});

const getDefaultConfigs = () => ({
  [COLOSSAL_AVIAN]: getDefaultColossalAvianConfig(),
  [STACK_OVERFLOW]: getDefaultStackOverflowConfig(),
});

export const isDefaultConfig = (configName: string) => {
  return Object.keys(getDefaultConfigs()).includes(configName);
};

export const getInitStackOverflow = () =>
  initRobotFromConfig(getDefaultStackOverflowConfig());

const ROBOT_CONFIGS_KEY = "TELEM_ROBOT_CONFIGS";

export const getRobotConfigs = (): Record<string, RobotConfig> => {
  const configs = localStorage.getItem(ROBOT_CONFIGS_KEY);
  const defaults = getDefaultConfigs();

  if (!configs) {
    localStorage.setItem(ROBOT_CONFIGS_KEY, JSON.stringify(defaults));
    return defaults;
  } else {
    const parsedConfigs = JSON.parse(configs);
    // use latest code values for Avian and Stack
    Object.values(defaults).forEach((defaultConfig) => {
      parsedConfigs[defaultConfig.name] = defaultConfig;
    });
    return parsedConfigs;
  }
};

export const saveRobotConfig = (config: RobotConfig) => {
  const configs = getRobotConfigs();
  configs[config.name] = config;
  localStorage.setItem(ROBOT_CONFIGS_KEY, JSON.stringify(configs));
  setCurrentRobotName(config.name);
};

export const deleteRobotConfig = (name: string) => {
  const configs = getRobotConfigs();
  delete configs[name];
  localStorage.setItem(ROBOT_CONFIGS_KEY, JSON.stringify(configs));
};

const CURRENT_ROBOT_NAME_KEY = "TELEM_CURRENT_ROBOT_NAME";

export const setCurrentRobotName = (name: string) => {
  localStorage.setItem(CURRENT_ROBOT_NAME_KEY, name);
};

export const getCurrentRobotName = () => {
  const defaultName = COLOSSAL_AVIAN;
  const name = localStorage.getItem(CURRENT_ROBOT_NAME_KEY);
  if (!name) {
    localStorage.setItem(CURRENT_ROBOT_NAME_KEY, defaultName);
    return defaultName;
  }
  return name;
};

export const getCurrentRobotConfig = (): RobotConfig => {
  const name = getCurrentRobotName();
  const configs = getRobotConfigs();
  return configs[name];
};

export const getInitRobot = (): Robot => {
  const config = getCurrentRobotConfig();
  return initRobotFromConfig(config);
};
