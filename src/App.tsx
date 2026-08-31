import { check } from "@tauri-apps/plugin-updater";
import { useEffect } from "react";
import styled from "styled-components";
import "./App.css";
import { DashboardDisplay } from "./DashboardDisplay";
import "./reset.css";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export async function checkForUpdates() {
  try {
    const update = await check();

    if (update) {
      console.log(`Update available: ${update.version}`);
      await update.downloadAndInstall();
    }
  } catch (error) {
    console.error("Update check failed:", error);
  }
}

function App() {
  useEffect(() => {
    checkForUpdates();
  });
  return (
    <Container>
      <DashboardDisplay />
    </Container>
  );
}

export default App;
