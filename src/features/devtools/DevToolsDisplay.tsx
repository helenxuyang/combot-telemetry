import styled from "styled-components";
import { StartupMessage } from "../../messageTypes";
import { useClearRobot, useUpdateRobot } from "../../robotStore";
import { ButtonsHolder } from "../../styles";
import { MockDataMessageSender } from "./MockDataMessageSender";
import { MockErrorMessageSender } from "./MockErrorMessageSender";
import { MockImporter } from "./MockImporter";
import { MockRawMessageSender } from "./MockRawMessageSender";
import { StyledContainer } from "./devToolsStyles";

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DevToolsDisplay = () => {
  const clearRobot = useClearRobot();
  const updateRobot = useUpdateRobot();

  const sendStartupMessage = () => {
    const message: StartupMessage = {
      messageType: "startupMessage",
      snr: 0,
      uuid: crypto.randomUUID(),
      rawMessage: "<FF FE FD FC FB FA F9 F8 F7 F6 F5 F4 F3 F2 F1 F0 EF 0>",
    };
    updateRobot([message]);
  };

  return (
    <Holder>
      <StyledContainer>
        <h2>General</h2>
        <ButtonsHolder>
          <button onClick={sendStartupMessage}>Send startup message</button>
          <button onClick={clearRobot}>Clear robot</button>
        </ButtonsHolder>
      </StyledContainer>
      <MockDataMessageSender />
      <MockErrorMessageSender />
      <MockImporter />
      <MockRawMessageSender />
    </Holder>
  );
};
