import { useMemo } from "react";
import styled from "styled-components";
import { RobotDisplay } from "./RobotDisplay";
import { NavigationTabs, type Tab } from "./Tabs";
import { ConfigDisplay } from "./features/configuration/components/ConfigDisplay";
import { GraphGrid } from "./features/graph/components/GraphGrid";
import { useRobotConfig } from "./robotStore";
import { useInitializer } from "./useInitializer";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeaderHolder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
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
