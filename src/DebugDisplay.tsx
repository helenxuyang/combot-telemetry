import { mapEscs, mapMeasurements } from "./dataUtils";
import { useRobot } from "./store";

const numValuesToShow = 5;

export const DebugDisplay = () => {
  const robot = useRobot();
  return (
    <details>
      <summary>Debug</summary>
      <div>
        {mapEscs(robot.escs, (esc) => {
          return (
            <div key={esc.name}>
              <strong>{esc.name}</strong>
              <p>
                {" "}
                Timestamps: [{esc.timestamps.slice(-numValuesToShow).join(",")}]
              </p>
              {mapMeasurements(esc.measurements, (measurement) => {
                return (
                  <div key={`${esc.name}-${measurement.name}`}>
                    <p>
                      {measurement.name}: [
                      {measurement.values.slice(-numValuesToShow).join(",")}]
                    </p>
                  </div>
                );
              })}
              <div>
                Error timestamps: [
                {esc.errors
                  .map((error) => `${error.timestamp}: ${error.code}`)
                  .join(",")}
                ]
              </div>
            </div>
          );
        })}
        <div>
          Unknown errors:
          {robot.unknownMessages
            .slice(-numValuesToShow)
            .map((unknownMessage) => `${unknownMessage.rawMessage}`)
            .join(",")}
        </div>
      </div>
    </details>
  );
};
