// import { useState, type ChangeEvent } from "react";
// import { getInitRobot } from "./storageUtils";
// import { useSetRobot } from "./store";
// import styled from "styled-components";
// import { INPUT, type Robot } from "./robot";

// const NEW_SESSION_MARKER = "-- NEW SESSION -- ";

// type SessionInfo = {
//   duration: number;
//   raw: string;
// };

// const SessionButton = styled.button<{ $isSelected: boolean }>`
//   ${({ $isSelected }) => $isSelected && " text-decoration: underline;"};
// `;

// export const RawDataImporter = () => {
//   const setRobot = useSetRobot();
//   const [sessions, setSessions] = useState<SessionInfo[]>([]);
//   const [selectedSession, setSelectedSession] = useState<number | null>(null);

//   const readFile = (event: ChangeEvent<HTMLInputElement>) => {
//     if (!event.target.files) {
//       return;
//     }
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.addEventListener("load", () => {
//       const rawData = reader.result as string; // TODO: make sure cast is ok?
//       const rawSessions = rawData
//         .split(NEW_SESSION_MARKER)
//         .filter((data) => data.length > 0 && data !== "\n"); // filter out empty sessions to be safe

//       setSessions(rawSessions.map((session) => findSessionInfo(session)));
//     });

//     reader.readAsText(file);
//   };

//   const extractTimestamp = (rawMessageData: string) => {
//     const timestamp = rawMessageData
//       .substring(0, rawMessageData.length - 1)
//       .split(" ")
//       .at(-1);
//     return Number("0x" + timestamp);
//   };

//   const findSessionInfo = (rawSessionData: string) => {
//     const data = rawSessionData.trim();
//     const firstLine = data.substring(0, data.indexOf("\n"));
//     // remove ending > and get last value
//     const firstTimestamp = extractTimestamp(firstLine);
//     const lastLine = data.substring(data.lastIndexOf("\n"));
//     const lastTimestamp = extractTimestamp(lastLine);
//     const durationMin = (lastTimestamp - firstTimestamp) / 1000 / 60;
//     return { duration: Number(durationMin.toFixed(2)), raw: data };
//   };

//   const selectSession = (index: number, session: SessionInfo) => {
//     setSelectedSession(index);
//     // TODO: maybe don't mutate
//     // eslint-disable-next-line prefer-const
//     let robot = getInitRobot();
//     const rawLines = session.raw.split("\n");
//     console.log(rawLines);

//     rawLines.forEach((line) => {
//       const parsedMessage = parseMessage(line);

//       updateRobot(robot, parsedMessage);
//     });
//     setRobot(robot);
//     console.log("Imported robot", robot);
//   };

//   const updateRobot = (robot: Robot, message: ParsedMessage) => {
//     const { messageType } = message;
//     if (messageType === "data") {
//       const { escName, timestamp, escData } = message;
//       if (!robot.escs[escName]) {
//         return;
//       }
//       Object.entries(escData).forEach(([measurementKey, measurementValue]) => {
//         robot.escs[escName].measurements[measurementKey].values.push(
//           measurementValue,
//         );
//       });
//       robot.escs[escName].timestamps.push(timestamp);
//     } else if (messageType === "input") {
//       const { escName, timestamp, escData } = message;
//       if (!robot.escs[escName]) {
//         return;
//       }
//       robot.escs[escName].inputs.timestamps.push(timestamp);
//       robot.escs[escName].inputs.values.push(escData[INPUT]);
//     } else if (messageType === "error") {
//       const { escName, timestamp, code } = message;
//       robot.escs[escName].errors.push({ code, timestamp });
//     }
//   };

//   return (
//     <div>
//       <input type="file" onChange={readFile} />
//       {sessions.length > 0 && <h3>Sessions</h3>}
//       {sessions.map((session, index) => (
//         <SessionButton
//           $isSelected={index === selectedSession}
//           onClick={() => selectSession(index, session)}
//         >{`Session ${index + 1}: ${session.duration}min`}</SessionButton>
//       ))}
//     </div>
//   );
// };
