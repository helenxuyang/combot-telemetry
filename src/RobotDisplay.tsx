import { ConsumptionDonut } from "./features/live/components/ConsumptionDonut";
import { calculateTotal, getLatestValue } from "./dataUtils";
import { BarDisplay } from "./features/live/components/BarDisplay";
import { CONSUMPTION, CURRENT, ESC, EscId, VOLTAGE } from "./robot";
import {
  BACKGROUND,
  ControlsGrid,
  ControlsSection,
  SMALL_VIEWPORT,
} from "./styles";
import { VoltageDisplay } from "./features/live/components/VoltageDisplay";
import styled from "styled-components";
import { ESCDisplay } from "./features/live/components/ESCDisplay";
import { useRobot, useRobotConfig } from "./store";
import { METADATA } from "./displayUtils";
import { SerialConnector } from "./features/live/components/SerialConnector";
import { UnknownMessagesDisplay } from "./features/live/components/UnknownMessagesDisplay";
import { RobotImporter } from "./RobotImporter";

const ESCSection = styled.div`
  flex: 4;
`;

const ESCGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RobotSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RobotLayout = styled.div`
  display: flex;

  > * {
    width: 100%;
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
    > * {
      width: auto;
    }
  }
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const LayoutColumn = styled.div`
  display: flex;
  flex-direction: column;
  background: ${BACKGROUND};
`;

const BarsHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

const HorizontalBarsHolder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 8px;
  background: ${BACKGROUND};

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const FlexBar = styled(BarDisplay)`
  flex: 1;
`;

const TOTAL_CURRENT = "Total Current";
const TOTAL_CONSUMPTION = "Total Consumption";

export const RobotDisplay = () => {
  const robot = useRobot();
  const config = useRobotConfig();

  if (!robot) {
    return <div>No robot</div>;
  }

  const escs = Object.values(robot.escs);
  if (escs.length === 0) {
    return <div>No ESCs</div>;
  }
  if (config === null) {
    return <div>No config</div>;
  }

  const referenceEscKey = Object.keys(robot.escs)[0] as EscId;
  const referenceEsc = robot.escs[referenceEscKey];
  const referenceConfig = config.escConfigs[referenceEscKey];

  if (!referenceEsc || !referenceConfig) {
    return null;
  }

  const totalCurrent = calculateTotal(
    escs.map((esc) => getLatestValue(esc.data.measurements[CURRENT].values)),
  );
  const totalConsumption = calculateTotal(
    escs.map((esc) =>
      getLatestValue(esc.data.measurements[CONSUMPTION].values),
    ),
  );

  return (
    <Layout>
      <RobotSection>
        <RobotLayout>
          <BarsHolder>
            <VoltageDisplay
              escs={escs}
              {...referenceConfig.measurementConfigs[VOLTAGE]}
            />
            <HorizontalBarsHolder>
              <FlexBar
                name={TOTAL_CURRENT}
                value={totalCurrent}
                unit={METADATA[CURRENT].unit}
                {...referenceConfig.measurementConfigs[CURRENT]}
                orientation="horizontal"
              />
              <FlexBar
                name={TOTAL_CONSUMPTION}
                value={totalConsumption}
                unit={METADATA[CONSUMPTION].unit}
                {...referenceConfig.measurementConfigs[CONSUMPTION]}
                orientation="horizontal"
              />
            </HorizontalBarsHolder>
          </BarsHolder>
          <LayoutColumn>
            <ConsumptionDonut escs={escs} />
          </LayoutColumn>
        </RobotLayout>
      </RobotSection>
      <ESCSection>
        <ESCGrid>
          {(Object.entries(robot.escs) as [EscId, ESC][]).map(([id, esc]) => (
            <ESCDisplay
              key={esc.name}
              esc={esc}
              config={config.escConfigs[id]}
            />
          ))}
        </ESCGrid>
      </ESCSection>
      <ControlsGrid>
        <ControlsSection>
          <SerialConnector />
        </ControlsSection>
        <ControlsSection>
          <UnknownMessagesDisplay />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
