import styled from "styled-components";
import "./App.css";
import { DashboardDisplay } from "./DashboardDisplay";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

function App() {
  return (
    <Container>
      <DashboardDisplay />
    </Container>
  );
}

export default App;
