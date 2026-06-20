import { useRobot } from "./store";

export const UnknownMessagesDisplay = () => {
  const robot = useRobot();
  return (
    <div>
      <h2>Unknown Messages</h2>
      <p>Count: {robot.unknownMessages.length}</p>
      <p>Last: {robot.unknownMessages.at(-1)?.rawMessage ?? "none"}</p>
      <details>
        <summary>All</summary>
        <p>
          {robot.unknownMessages
            .map((unknown) => unknown.rawMessage)
            .join(", ")}
        </p>
      </details>
    </div>
  );
};
