import { ConsumptionDonut } from "./features/live/components/ConsumptionDonut";
import { calculateTotal, getLatestValue } from "./dataUtils";
import { BarDisplay } from "./features/live/components/BarDisplay";
import { CURRENT, ESC, EscId, VOLTAGE } from "./robot";
import { VoltageDisplay } from "./features/live/components/VoltageDisplay";
import styled, { css } from "styled-components";
import { ESCDisplay } from "./features/live/components/ESCDisplay";
import { useRobot, useRobotConfig } from "./store";
import { METADATA } from "./displayUtils";
import { SerialConnector } from "./features/live/components/SerialConnector";
import { UnknownMessagesDisplay } from "./features/live/components/UnknownMessagesDisplay";
import { ESC_COLORS, MEDIUM_VIEWPORT, SMALL_VIEWPORT } from "./styles";

const EQUAL_LAYOUT = css`
  display: grid;
  gap: 8px;
  grid-template-columns: 40% 40% 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "esc0 esc1 info"
    "esc2 esc3 info"
    "control control control";

  @media (max-height: 800px) {
    height: auto;
  }

  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    height: auto;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: none;
    grid-template-areas:
      "esc0 esc1"
      "esc2 esc3"
      "info info"
      "control control";
  }
  @media (max-width: ${SMALL_VIEWPORT}px) {
    grid-template-columns: none;
    grid-template-rows: none;
    grid-template-areas:
      "esc0"
      "esc1"
      "esc2"
      "esc3"
      "info"
      "info"
      "control"
      "control";
  }
`;

const DisplayHolder = styled.div`
  width: 100%;
  ${EQUAL_LAYOUT}
`;

const EscDisplayHolder = styled.div`
  min-width: 0;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
`;

const InfoHolder = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    flex-direction: row;
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const InfoBarHolder = styled.div`
  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    height: 100%;
    flex: 1;
    min-width: 100px;
  }
`;

const ConsumptionDonutHolder = styled.div`
  flex: 1;
  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    min-width: min-content;
    flex: 1 0 auto;
  }
`;

const SerialConnectorHolder = styled.div`
  min-height: 0;
  flex: 1;
  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    flex: 1;
  }
  @media (max-width: ${SMALL_VIEWPORT}px) {
    min-height: 200px;
  }
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
      {(Object.entries(robot.escs) as [EscId, ESC][]).map(([id, esc]) => (
        <EscDisplayHolder style={{ gridArea: `esc${id}` }}>
          <ESCDisplay
            key={esc.name}
            esc={esc}
            config={config.escConfigs[id]}
            accentColor={ESC_COLORS[id]}
          />
        </EscDisplayHolder>
      ))}
      <InfoHolder style={{ gridArea: "info" }}>
        <InfoBarHolder>
          <VoltageDisplay
            escs={escs}
            {...referenceConfig.measurementConfigs[VOLTAGE]}
          />
        </InfoBarHolder>
        <InfoBarHolder>
          <BarDisplay
            name="Total Current"
            value={totalCurrent}
            unit={METADATA[CURRENT].unit}
            {...referenceConfig.measurementConfigs[CURRENT]}
            orientation="horizontal"
            headingLevel={2}
          />
        </InfoBarHolder>
        <ConsumptionDonutHolder>
          <ConsumptionDonut escs={escs} />
        </ConsumptionDonutHolder>
        <SerialConnectorHolder>
          <SerialConnector />
        </SerialConnectorHolder>
      </InfoHolder>

      <div style={{ gridArea: "control" }}>
        <UnknownMessagesDisplay />
      </div>
    </DisplayHolder>
  );
};
