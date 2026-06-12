import styled, { css } from "styled-components";

export const MEDIUM_VIEWPORT = 800;
export const SMALL_VIEWPORT = 600;

export const BACKGROUND = "#ddd";

export const Container = styled.div`
  background-color: ${BACKGROUND};
  padding: 8px;
  color: black;
`;

export const Value = styled.p`
  font-weight: bold;
  font-size: 24px;
  line-height: normal;
  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    font-size: 18px;
  }
  white-space: nowrap;
  min-width: 65px;
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
