import styled, { css } from "styled-components";

export const MEDIUM_VIEWPORT = 800;
export const SMALL_VIEWPORT = 600;

export const BACKGROUND = "#ccc";
export const ESC_COLORS = ["#3852B4", "#5E7AC4", "#F08D39", "#F3BE7A"];

export const Container = styled.div`
  background-color: ${BACKGROUND};
  padding: 4px;
  color: black;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const HorizontalContainer = styled(Container)`
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex: 1;
`;

export const Value = styled.p<{ $valueMinCharacters?: number }>`
  font-weight: bold;
  font-size: 24px;
  line-height: normal;
  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    font-size: 18px;
  }
  white-space: nowrap;
  min-width: ${(props) =>
    props.$valueMinCharacters ? `${props.$valueMinCharacters}ch` : "65px"};
`;

export const ButtonsHolder = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

export const pulseAnimation = (speedSec: number = 2) => css`
  @keyframes pulse {
    0% {
      opacity: 100%;
    }
    50% {
      opacity: 50%;
    }
    100% {
      opacity: 100%;
    }
  }
  animation: pulse ${speedSec ?? 2}s infinite;
`;

export const WarningText = styled.div`
  color: red;
`;

export const SpacedRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
    align-items: start;
    gap: 16px;
  }
`;

export const CondensedButton = styled.button`
  padding: 4px;
  font-size: 12px;
  background-color: #ddd;
  border: none;
`;

export const ControlsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 3px solid black;
  padding: 16px;
`;

export const Table = styled.table`
  border: 1px solid black;
  border-collapse: collapse;
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
    padding: 4px;
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    width: 100%;
    tr {
      display: block;
      border-bottom: 1px solid black;
    }
    th,
    td {
      display: block;
      border: none;
      position: relative;
      text-align: left;
    }
  }
`;
