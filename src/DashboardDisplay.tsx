import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";
import { MatchControls } from "./MatchControls";
import { ConfigDisplay } from "./ConfigDisplay";
import { useEffect, useMemo } from "react";
import { useRobot, useSetRobot, useSetRobotConfig } from "./store";
import { FullscreenButton } from "./FullscreenButton";
import { RobotDisplay } from "./RobotDisplay";
import { TauriWebSocketConnector } from "./TauriWebSocketConnector";
import { FakeDataToggle } from "./FakeDataToggle";
import { UnknownMessagesDisplay } from "./UnknownMessagesDisplay";
import { getInitRobot, initializeConfigStorage } from "./configUtils";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const HeaderHolder = styled.div`
  display: flex;

  justify-content: space-between;
`;

const ControlsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 3px solid black;
  padding: 16px;
  flex: 1;
`;

export const DashboardDisplay = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const setRobotConfig = useSetRobotConfig();

  useEffect(() => {
    const getRobot = async () => {
      const { robot, config } = await getInitRobot();
      setRobotConfig(config);
      setRobot(robot);
    };
    getRobot();
  }, []);

  const tabs: Tab[] = useMemo(
    () => [
      {
        name: "Live",
        panelContent: <RobotDisplay />,
      },
      // {
      //   name: "Graph",
      //   panelContent: <GraphGrid />,
      // },
      {
        name: "Config",
        panelContent: <ConfigDisplay />,
      },
    ],
    [],
  );

  if (!robot) {
    return <div>No robot</div>;
  }

  return (
    <Layout>
      <HeaderHolder>
        <h1>{robot.name}</h1>
        <MatchControls />
      </HeaderHolder>
      <NavigationTabs tabs={tabs} />
      <ControlsGrid>
        {/* <ControlsSection>
          <FakeDataToggle />
          <FullscreenButton />
        </ControlsSection> */}
        <ControlsSection>
          <TauriWebSocketConnector />
        </ControlsSection>
        <ControlsSection>{/* <RobotImporter /> */}</ControlsSection>
        <ControlsSection>
          <UnknownMessagesDisplay />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
