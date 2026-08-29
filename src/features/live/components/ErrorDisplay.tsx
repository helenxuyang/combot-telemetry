import type { ESC } from "../../../robot";
import { WarningText } from "../../../styles";

type Props = { errors: ESC["errors"]; className?: string };

export const ErrorDisplay = ({ errors, className }: Props) => {
  return (
    errors.length > 0 && (
      <WarningText className={className}>
        ERRORS | Count: {errors.length} | Last code: {errors.at(-1)?.errorCode}
      </WarningText>
    )
  );
};
