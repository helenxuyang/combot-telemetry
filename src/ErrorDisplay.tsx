import type { ESC } from "./robot";
import { WarningText } from "./styles";

type Props = { errors: ESC["errors"] };

export const ErrorDisplay = ({ errors }: Props) => {
  return (
    errors.length > 0 && (
      <WarningText>
        ERRORS: {errors.length} Last: {errors.at(-1)?.errorCode}
      </WarningText>
    )
  );
};
