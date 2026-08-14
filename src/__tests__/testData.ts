import { Robot } from "../robot";

export const DRIVE_LEFT_ESC = "DRIVE_LEFT";
export const DRIVE_RIGHT_ESC = "DRIVE_RIGHT";
export const WEAPON_ESC = "WEAPON";
export const ARM_ESC = "ARM";

export const getMockRobot = () => {
  const robot: Robot = {
    name: "TestBot",
    escs: {
      a: {
        name: "Drive",
        timestamps: [2, 4, 6, 8, 10],

        data: {
          temperature: [30, 30, 35, 35, 40],
          rpm: [1000, 2000, 3000, 4000, 5000],
          voltage: [20, 20, 19, 19, 18],
          current: [20, 20, 20, 20, 20],
          consumption: [200, 200, 200, 200, 200],
          input: [0, 0, 50, 50, -50],
        },
        errors: [],
      },
      b: {
        name: "Weapon",
        timestamps: [1, 3],
        data: {
          temperature: [90, 90],
          rpm: [3000, 3000],
          voltage: [20, 20],
          current: [30, 30],
          consumption: [300, 300],
          input: [0, 0],
        },
        errors: [
          { errorCode: 1, timestamp: 11 },
          { errorCode: 2, timestamp: 12 },
        ],
      },
    },
    unknownMessages: [
      {
        rawMessage: "<>",
      },
    ],
    initialTimestamp: null,
    matchMarkers: [
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
    ],
    signalStrengths: [
      {
        value: 1,
        timestamp: 1,
      },
      {
        value: 2,
        timestamp: 2,
      },
      {
        value: 3,
        timestamp: 3,
      },
    ],
  };

  return robot;
};
