import { useSignalStrength } from "../../../robotStore";
import { SignalStrengthDisplay } from "./SignalStrengthDisplay";

export const SignalStrengthContainer = () => {
  const signalStrength = useSignalStrength();

  return <SignalStrengthDisplay signalStrength={signalStrength} />;
};
