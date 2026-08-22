import { useRobot } from "../../../store";
import { HorizontalContainer } from "../../../styles";

export const UnknownMessagesDisplay = () => {
  const robot = useRobot();

  if (!robot) {
    return <div>No robot</div>;
  }

  return (
    <HorizontalContainer>
      <h3>Unknown Messages</h3>
      <p>
        Count: {robot.unknownMessages.length} | Last:{" "}
        {robot.unknownMessages.at(-1)?.rawMessage ?? "none"}
      </p>
      {/* <details>
        <summary>All</summary>
        <p>
          {robot.unknownMessages
            .map((unknown) => unknown.rawMessage)
            .join(", ")}
        </p>
      </details> */}
    </HorizontalContainer>
  );
};
