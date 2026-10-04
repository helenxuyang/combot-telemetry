import { EscId } from "../../../robot";
import { useRobot, useRobotConfig } from "../../../robotStore";
import { BarDisplay } from "../../live/components/BarDisplay";
import { useGraphCurrentTime } from "../videoPlaybackStore";

type Props = {
  escId: EscId;
};

export const InputPlayback = ({ escId }: Props) => {
  const robot = useRobot();
  const config = useRobotConfig();
  const timestamp = useGraphCurrentTime() * 1000;

  if (!robot || !config || !robot.escs[escId] || !config.escConfigs[escId]) {
    return null;
  }

  const esc = robot.escs[escId];
  const inputs = esc.data.input;
  const timestamps = esc.timestamps;

  const escConfig = config.escConfigs[escId];
  const inputConfig = escConfig.measurementConfigs.input;

  const timestampIndex = timestamps.findIndex((time) => time >= timestamp) - 1;

  const input = inputs[timestampIndex] ?? 0;

  return (
    <div>
      <h2>{esc.name}</h2>
      <BarDisplay
        name={""}
        value={input}
        unit={""}
        min={inputConfig.min}
        max={inputConfig.max}
        isDirectional={true}
      />
    </div>
  );
};
