import {
  DRIVE_LEFT_ESC,
  RPM,
  VOLTAGE,
  CURRENT,
  CONSUMPTION,
  TEMPERATURE,
  DRIVE_RIGHT_ESC,
  WEAPON_ESC,
} from "../robot";
import { getInitColossalAvian } from "../storageUtils";

export const getMockRobotWithData = () => {
  const robot = structuredClone(getInitColossalAvian());

  robot.escs[DRIVE_LEFT_ESC].timestamps = [1, 5, 10];
  robot.escs[DRIVE_LEFT_ESC].measurements[RPM].values = [1000, 2000, 3000];
  robot.escs[DRIVE_LEFT_ESC].measurements[VOLTAGE].values = [30, 20, 10];
  robot.escs[DRIVE_LEFT_ESC].measurements[CURRENT].values = [100, 100, 100];
  robot.escs[DRIVE_LEFT_ESC].measurements[CONSUMPTION].values = [500, 600, 700];
  robot.escs[DRIVE_LEFT_ESC].measurements[TEMPERATURE].values = [25, 50, 75];
  robot.escs[DRIVE_LEFT_ESC].inputs.timestamps = [3, 6];
  robot.escs[DRIVE_LEFT_ESC].inputs.values = [0, 100];

  robot.escs[DRIVE_RIGHT_ESC].timestamps = [2, 4];
  robot.escs[DRIVE_RIGHT_ESC].measurements[RPM].values = [5000, 6000];
  robot.escs[DRIVE_RIGHT_ESC].measurements[VOLTAGE].values = [20, 30];
  robot.escs[DRIVE_RIGHT_ESC].measurements[CURRENT].values = [80, 90];
  robot.escs[DRIVE_RIGHT_ESC].measurements[CONSUMPTION].values = [700, 800];
  robot.escs[DRIVE_RIGHT_ESC].measurements[TEMPERATURE].values = [50, 50];
  robot.escs[DRIVE_RIGHT_ESC].inputs.timestamps = [5, 8];
  robot.escs[DRIVE_RIGHT_ESC].inputs.values = [-100, -100];

  robot.escs[WEAPON_ESC].errors = [
    { errorCode: 1, timestamp: 11 },
    { errorCode: 2, timestamp: 12 },
  ];

  robot.matchMarkers = [
    {
      type: "START",
      timestamp: 0,
    },
    {
      type: "PAUSE",
      timestamp: 15,
    },
    {
      type: "RESUME",
      timestamp: 20,
    },
    {
      type: "END",
      timestamp: 25,
    },
  ];

  return robot;
};
