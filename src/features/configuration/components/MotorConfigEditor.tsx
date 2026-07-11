import { Draft } from "immer";
import { EscId } from "../../../robot";
import { MotorConfig } from "../configUtils";
import { NumberInput } from "./inputStyles";
import { Table } from "../../../styles";
import { useIsEditing } from "../../../store";

type Props = {
  config: MotorConfig;
  updateConfig: (
    updater: (config: Draft<MotorConfig> | undefined) => void,
  ) => void;
  escId: EscId;
};

export const MotorConfigEditor = ({ config, updateConfig, escId }: Props) => {
  const isEditing = useIsEditing();
  return (
    <Table>
      <thead>
        <tr>
          <th>Motor Property</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Gear ratio</td>
          <td>
            <NumberInput
              id={`${escId}-gear-ratio`}
              value={config.gearRatio}
              type="number"
              required
              readOnly={!isEditing}
              $isEditable={isEditing}
              onChange={(e) => {
                updateConfig((config) => {
                  if (config) {
                    config.gearRatio = Number(e.target.value);
                  }
                });
              }}
            />
          </td>
        </tr>
        <tr>
          <td>Motor pole pairs</td>
          <td>
            <NumberInput
              id={`${escId}-motor-pole-pairs`}
              value={config.motorPolePairs}
              type="number"
              required
              readOnly={!isEditing}
              $isEditable={isEditing}
              onChange={(e) => {
                updateConfig((config) => {
                  if (config) {
                    config.motorPolePairs = Number(e.target.value);
                  }
                });
              }}
            />
          </td>
        </tr>
      </tbody>
    </Table>
  );
};
