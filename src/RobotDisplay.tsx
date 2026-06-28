import { ConsumptionDonut } from "./ConsumptionDonut";
import { calculateTotal, getLatestValue } from "./dataUtils";
import { BarDisplay } from "./BarDisplay";
import { CONSUMPTION, CURRENT } from "./robot";
import { BACKGROUND, SMALL_VIEWPORT } from "./styles";
import { VoltageDisplay } from "./VoltageDisplay";
import styled from "styled-components";
import { ESCDisplay } from "./ESCDisplay";
import { useRobot } from "./store";
import { METADATA } from "./displayUtils";

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

  const escs = Object.values(robot.escs);
  const referenceEsc = escs[0];
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
            <VoltageDisplay escs={Object.values(robot.escs)} />
            <HorizontalBarsHolder>
              <FlexBar
                name={TOTAL_CURRENT}
                value={totalCurrent}
                unit={METADATA[CURRENT].unit}
                config={referenceEsc.data.measurements[CURRENT].config}
                orientation="horizontal"
              />
              <FlexBar
                name={TOTAL_CONSUMPTION}
                value={totalConsumption}
                unit={METADATA[CONSUMPTION].unit}
                config={referenceEsc.data.measurements[CONSUMPTION].config}
                orientation="horizontal"
              />
            </HorizontalBarsHolder>
          </BarsHolder>
          <LayoutColumn>
            <ConsumptionDonut escs={Object.values(robot.escs)} />
          </LayoutColumn>
        </RobotLayout>
      </RobotSection>
      <ESCSection>
        <ESCGrid>
          {Object.values(robot.escs).map((esc) => (
            <ESCDisplay esc={esc} />
          ))}
        </ESCGrid>
      </ESCSection>
    </Layout>
  );
};
