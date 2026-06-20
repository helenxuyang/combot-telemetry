import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";
import { MatchControls } from "./MatchControls";
import { CSVDownloader } from "./CSVDownloader";
import { ConfigDisplay } from "./ConfigDisplay";
import { useMemo } from "react";
import { useRobot } from "./store";
import { FullscreenButton } from "./FullscreenButton";
import { RobotDisplay } from "./RobotDisplay";
import { TauriWebSocketConnector } from "./TauriWebSocketConnector";
import { FakeDataToggle } from "./FakeDataToggle";
import { UnknownMessagesDisplay } from "./UnknownMessagesDisplay";

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
      <HeaderHolder>
        <h1>{robot.name}</h1>
        <MatchControls />
      </HeaderHolder>
      <NavigationTabs tabs={tabs} />
      <ControlsGrid>
        <ControlsSection>
          <FakeDataToggle />
          <FullscreenButton />
        </ControlsSection>
        <ControlsSection>
          <TauriWebSocketConnector />
        </ControlsSection>
        <ControlsSection>
          <RobotImporter />
          <CSVDownloader />
        </ControlsSection>
        <ControlsSection>
          <UnknownMessagesDisplay />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
