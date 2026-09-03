import styled, { css } from "styled-components";

export const MEDIUM_VIEWPORT = 1280;
export const SMALL_VIEWPORT = 800;
export const EXTRA_SMALL_VIEWPORT = 500;

const createMediaQuery = (viewport: number) =>
  `@media (max-width: ${viewport}px)`;

export const media = {
  medium: createMediaQuery(MEDIUM_VIEWPORT),
  small: createMediaQuery(SMALL_VIEWPORT),
  extraSmall: createMediaQuery(EXTRA_SMALL_VIEWPORT),
} as const;

export const BACKGROUND = "#f9f9f9";
export const PLOT_BASE_COLOR = "#e2e2e2";
export const PLOT_FILL_COLOR = "#00639B";

export const ESC_COLORS = ["#00639B", "#3997C1", "#56B1D4", "#72CBE6"];

export const Container = styled.div`
  background-color: ${BACKGROUND};
  padding: 8px;
  color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 8px;
`;

export const HorizontalContainer = styled(Container)`
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex: 1;
`;

export const Value = styled.p<{ $valueMinCharacters?: number }>`
  font-weight: bold;
  font-size: 30px;
  line-height: normal;
  ${media.medium} {
    font-size: 24px;
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

export const SelectableCondensedButton = styled(CondensedButton)<{
  $isSelected: boolean;
}>`
  ${({ $isSelected }) =>
    $isSelected &&
    css`
      text-decoration: underline;
      background-color: #222;
      color: white;
      &:hover {
        background-color: #444;
      }
    `};
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

  @media (max-width: ${EXTRA_SMALL_VIEWPORT}px) {
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
