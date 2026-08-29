import { CSSProperties, Fragment, useState } from "react";
import styled, { css } from "styled-components";
import { calculateTotal, getLatestValue } from "./dataUtils";
import { METADATA } from "./displayUtils";
import { BarDisplay } from "./features/live/components/BarDisplay";
import { ConsumptionDonut } from "./features/live/components/ConsumptionDonut";
import { ESCDisplay } from "./features/live/components/ESCDisplay";
import { SerialConnector } from "./features/live/components/SerialConnector";
import { VoltageDisplay } from "./features/live/components/VoltageDisplay";
import { useMediaQuery } from "./features/useMediaQuery";
import { CURRENT, ESC, EscId, VOLTAGE } from "./robot";
import { useRobot, useRobotConfig } from "./store";
import { ESC_COLORS, media } from "./styles";

const FOCUS_LAYOUT = css`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 3fr 2fr;
`;

const GRID_LAYOUT = css`
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

  ${media.medium} {
    height: auto;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: none;
    grid-template-areas:
      "esc0 esc1"
      "esc2 esc3"
      "info info"
      "control control";
  }
  ${media.small} {
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

const DisplayHolder = styled.div<{ $layout: Layout }>`
  width: 100%;
  ${({ $layout }) => ($layout === "GRID" ? GRID_LAYOUT : FOCUS_LAYOUT)}
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

  ${media.medium} {
    flex-direction: row;
  }

  ${media.small} {
    flex-direction: column;
  }
`;

const RobotInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoBarHolder = styled.div`
  ${media.medium} {
    height: 100%;
    flex: 1;
    min-width: 100px;
  }
`;

const ConsumptionDonutHolder = styled.div`
  flex: 1;
  ${media.medium} {
    min-width: min-content;
    flex: 1 0 auto;
  }
`;

const SerialConnectorHolder = styled.div`
  min-height: 0;
  flex: 1;
  ${media.medium} {
    flex: 1;
  }
  ${media.small} {
    min-height: 200px;
  }
`;

type Layout = "GRID" | "FOCUS";

export const RobotDisplay = () => {
  const robot = useRobot();
  const config = useRobotConfig();
  const isGridLayout = useMediaQuery("(max-width: 1280px)");
  const [focusedEscId] = useState<EscId | null>("2");

  const layout: Layout = isGridLayout ? "GRID" : "FOCUS";

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

  const InfoWrapper = layout === "GRID" ? InfoHolder : Fragment;

  return (
    <div key={layout}>
      <DisplayHolder $layout={layout}>
        {(Object.entries(robot.escs) as [EscId, ESC][]).map(([id, esc]) => {
          const isFocused = id === focusedEscId;
          let style: CSSProperties;
          if (layout === "GRID") {
            style = { gridArea: `esc${id}` };
          } else {
            style = isFocused
              ? { gridRow: "1", gridColumn: "4 / span 6" }
              : { gridRow: "2", gridColumn: "span 4" };
          }
          return (
            <EscDisplayHolder style={style} key={id}>
              <ESCDisplay
                esc={esc}
                config={config.escConfigs[id]}
                accentColor={ESC_COLORS[id]}
              />
            </EscDisplayHolder>
          );
        })}
        <InfoWrapper style={{ gridArea: "info" }}>
          <RobotInfo style={{ gridColumn: "1 / span 3", gridRow: "1" }}>
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
          </RobotInfo>
          <SerialConnectorHolder
            style={
              layout === "FOCUS"
                ? { gridColumn: "-4 / span 3", gridRow: 1 }
                : undefined
            }
          >
            <SerialConnector />
          </SerialConnectorHolder>
        </InfoWrapper>
      </DisplayHolder>
    </div>
  );
};
