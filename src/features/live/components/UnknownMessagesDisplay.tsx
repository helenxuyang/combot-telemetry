import styled from "styled-components";
import { useRobot } from "../../../robotStore";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;
export const UnknownMessagesDisplay = () => {
  const robot = useRobot();

  if (!robot) {
    return <div>No robot</div>;
  }

  return (
    <StyledContainer>
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
    </StyledContainer>
  );
};
