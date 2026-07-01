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
        data: {
          timestamps: [2, 4, 6, 8, 10],
          measurements: {
            temperature: {
              values: [30, 30, 35, 35, 40],
            },
            rpm: {
              values: [1000, 2000, 3000, 4000, 5000],
            },
            voltage: {
              values: [20, 20, 19, 19, 18],
            },
            current: {
              values: [20, 20, 20, 20, 20],
            },
            consumption: {
              values: [200, 200, 200, 200, 200],
            },
          },
        },
        inputs: {
          timestamps: [1, 2, 4, 7, 9],
          values: [0, 0, 50, 50, -50],
        },
        errors: [],
      },
      b: {
        name: "Weapon",
        data: {
          timestamps: [1, 3],
          measurements: {
            temperature: {
              values: [90, 90],
            },
            rpm: {
              values: [3000, 3000],
            },
            voltage: {
              values: [20, 20],
            },
            current: {
              values: [30, 30],
            },
            consumption: {
              values: [300, 300],
            },
          },
        },
        inputs: {
          timestamps: [2, 4, 5, 6],
          values: [0, 0, 0, 0],
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
  };

  return robot;
};
