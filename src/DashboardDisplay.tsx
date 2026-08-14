import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { ConfigDisplay } from "./features/configuration/components/ConfigDisplay";
import { useMemo } from "react";
import { useRobotConfig } from "./store";
import { RobotDisplay } from "./RobotDisplay";
import { GraphGrid } from "./features/graph/components/GraphGrid";
import { useInitializer } from "./useInitializer";

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
  const config = useRobotConfig();

  useInitializer();

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

  return (
    <Layout>
      <HeaderHolder>{config && <h1>{config.name}</h1>}</HeaderHolder>
      <NavigationTabs tabs={tabs} />
    </Layout>
  );
};
