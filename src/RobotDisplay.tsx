import { ConsumptionDonut } from "./features/live/components/ConsumptionDonut";
import { calculateTotal, getLatestValue } from "./dataUtils";
import { BarDisplay } from "./features/live/components/BarDisplay";
import { CURRENT, ESC, EscId, VOLTAGE } from "./robot";
import { ESC_COLORS } from "./styles";
import { VoltageDisplay } from "./features/live/components/VoltageDisplay";
import styled from "styled-components";
import { ESCDisplay } from "./features/live/components/ESCDisplay";
import { useRobot, useRobotConfig } from "./store";
import { METADATA } from "./displayUtils";
import { SerialConnector } from "./features/live/components/SerialConnector";
import { UnknownMessagesDisplay } from "./features/live/components/UnknownMessagesDisplay";

const DisplayHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 8px;
  min-width: 300px;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  height: 40px;
`;

const ESCGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

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
    escs.map((esc) => getLatestValue(esc.data[CURRENT])),
  );

  return (
    <DisplayHolder>
      <Layout>
        <div>
          <ESCGrid>
            {(Object.entries(robot.escs) as [EscId, ESC][]).map(([id, esc]) => (
              <ESCDisplay
                key={esc.name}
                esc={esc}
                config={config.escConfigs[id]}
                accentColor={ESC_COLORS[Number(id)]}
              />
            ))}
          </ESCGrid>
        </div>
        <Column>
          <VoltageDisplay
            escs={escs}
            {...referenceConfig.measurementConfigs[VOLTAGE]}
          />
          <BarDisplay
            name="Total Current"
            value={totalCurrent}
            unit={METADATA[CURRENT].unit}
            {...referenceConfig.measurementConfigs[CURRENT]}
            orientation="horizontal"
            headingLevel={2}
          />
          <ConsumptionDonut escs={escs} />
        </Column>
      </Layout>
      <Row>
        <SerialConnector />
        <UnknownMessagesDisplay />
      </Row>
    </DisplayHolder>
  );
};
