import styled from "styled-components";
import { JoystickDisplay } from "../../../JoystickDisplay";
import { EscId } from "../../../robot";
import { useRobot } from "../../../robotStore";
import { ESC_COLORS } from "../../../styles";
import { useGraphCurrentTime } from "../videoPlaybackStore";

const JoystickHolder = styled.div`
  margin: 24px;
`;

export const getInputY = (left: number, right: number) => {
  return (left + right) / 2;
};

export const getInputX = (left: number, right: number) => {
  return (left - right) / 2;
};

export const DrivePlayback = () => {
  const robot = useRobot();
  const timestamp = useGraphCurrentTime() * 1000;

  // TODO: make configurable
  const driveLeftEscId: EscId = "0";
  const driveRightEscId: EscId = "1";

  if (!robot || !robot.escs[driveLeftEscId] || !robot.escs[driveRightEscId]) {
    return null;
  }

  const leftInputs = robot.escs[driveLeftEscId].data.input;
  const rightInputs = robot.escs[driveRightEscId].data.input;

  const leftTimestamps = robot.escs[driveLeftEscId].timestamps;
  const rightTimestamps = robot.escs[driveRightEscId].timestamps;

  const leftTimestampIndex =
    leftTimestamps.findIndex((time) => time >= timestamp) - 1;
  const rightTimestampIndex =
    rightTimestamps.findIndex((time) => time >= timestamp) - 1;

  const leftInput = leftInputs[leftTimestampIndex] ?? 0;
  const rightInput = rightInputs[rightTimestampIndex] ?? 0;

  const xInput = getInputX(leftInput, rightInput);
  const yInput = getInputY(leftInput, rightInput);

  return (
    <div>
      <h2>Drive</h2>
      <JoystickHolder>
        <JoystickDisplay
          xInput={xInput}
          yInput={yInput}
          showLabels={false}
          joystickColor={ESC_COLORS[driveLeftEscId]}
        />
      </JoystickHolder>
    </div>
  );
};
