import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { MatchControls } from "./features/live/components/MatchControls";
import { ConfigDisplay } from "./features/configuration/components/ConfigDisplay";
import { useEffect, useMemo } from "react";
import { useRobot, useSetRobot, useSetRobotConfig } from "./store";
import { RobotDisplay } from "./RobotDisplay";
import { TauriWebSocketConnector } from "./features/live/components/TauriWebSocketConnector";
import { UnknownMessagesDisplay } from "./features/live/components/UnknownMessagesDisplay";
import { getInitRobot } from "./features/configuration/configUtils";
import { RobotImporter } from "./RobotImporter";

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
        <ControlsSection>
          <TauriWebSocketConnector />
        </ControlsSection>
        <ControlsSection>
          <UnknownMessagesDisplay />
        </ControlsSection>
        <ControlsSection>
          <RobotImporter />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
