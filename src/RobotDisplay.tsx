import { ConsumptionDonut } from "./ConsumptionDonut";
import { calculateTotal } from "./dataUtils";
import { BarDisplay } from "./BarDisplay";
import type { Measurement } from "./robot";
import {
  TOTAL_CURRENT,
  TOTAL_CONSUMPTION,
  DRIVE_LEFT_ESC,
  WEAPON_ESC,
  DRIVE_RIGHT_ESC,
  ARM_ESC,
  CONSUMPTION,
  CURRENT,
} from "./robot";
import { BACKGROUND, SMALL_VIEWPORT } from "./styles";
import { VoltageDisplay } from "./VoltageDisplay";
import styled from "styled-components";
import { ESCDisplay } from "./ESCDisplay";
import { useRobot } from "./store";

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
`;

const FlexBar = styled(BarDisplay)`
  flex: 1;
`;

export const RobotDisplay = () => {
  const robot = useRobot();
  const referenceEsc = Object.values(robot.escs)[0];

  const { min: minCurrent, max: maxCurrent } =
    referenceEsc.measurements[CURRENT];
  const { min: minConsumption, max: maxConsumption } =
    referenceEsc.measurements[CONSUMPTION];

  const totalCurrent = calculateTotal(CURRENT, robot.escs);
  const totalConsumption = calculateTotal(CONSUMPTION, robot.escs);

  const currentMeasurement: Measurement = {
    name: TOTAL_CURRENT,
    values: [totalCurrent],
    min: minCurrent,
    max: maxCurrent,
    unit: "A",
    shouldShow: true,
  };

  const consumptionMeasurement: Measurement = {
    name: TOTAL_CONSUMPTION,
    values: [totalConsumption],
    min: minConsumption,
    max: maxConsumption,
    unit: "mAh",
    shouldShow: true,
  };

  return (
    <Layout>
      <RobotSection>
        Latest timestamp:
        {Math.max(
          ...Object.values(robot.escs).map((esc) => esc.timestamps.at(-1) ?? 0),
        )}
        <RobotLayout>
          <BarsHolder>
            <VoltageDisplay escs={robot.escs} />
            <HorizontalBarsHolder>
              <FlexBar
                measurement={currentMeasurement}
                orientation="horizontal"
              />
              <FlexBar
                measurement={consumptionMeasurement}
                orientation="horizontal"
              />
            </HorizontalBarsHolder>
          </BarsHolder>
          <LayoutColumn>
            <ConsumptionDonut escs={robot.escs} />
          </LayoutColumn>
        </RobotLayout>
      </RobotSection>
      <ESCSection>
        <ESCGrid>
          <ESCDisplay esc={robot.escs[DRIVE_LEFT_ESC]} />
          <ESCDisplay esc={robot.escs[WEAPON_ESC]} shouldPlayRPMAlert />
          <ESCDisplay esc={robot.escs[DRIVE_RIGHT_ESC]} />
          <ESCDisplay esc={robot.escs[ARM_ESC]} />
        </ESCGrid>
      </ESCSection>
    </Layout>
  );
};
