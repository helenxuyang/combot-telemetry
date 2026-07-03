import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { MatchControls } from "./features/live/components/MatchControls";
import { ConfigDisplay } from "./features/configuration/components/ConfigDisplay";
import { useEffect, useMemo } from "react";
import { useRobot, useSetRobot, useSetRobotConfig } from "./store";
import { RobotDisplay } from "./RobotDisplay";
import { getInitRobot } from "./features/configuration/configUtils";
import { GraphGrid } from "./features/graph/components/GraphGrid";

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
      {
        name: "Graph",
        panelContent: <GraphGrid />,
      },
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
    </Layout>
  );
};
