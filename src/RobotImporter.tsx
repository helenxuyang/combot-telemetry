import CSVReader from "react-csv-reader";
import { importRobot } from "./csvUtils";
import { getCurrentRobotConfig } from "./storageUtils";
import { useSetRobot } from "./store";

export const RobotImporter = () => {
  const setRobot = useSetRobot();
  const handleFileLoaded = (data: string[][]) => {
    const robot = importRobot(getCurrentRobotConfig(), data);
    setRobot(robot);
  };
  return <CSVReader onFileLoaded={handleFileLoaded} />;
};
