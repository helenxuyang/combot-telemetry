import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import styled from "styled-components";

export type Tab = {
  name: string;
  panelContent: ReactNode;
};

const getTabId = (tabName: string) =>
  `navigation-tab-${tabName.toLowerCase().replace(" ", "-")}`;

const StyledTabButtonHolder = styled.div`
  display: flex;
  gap: 16px;
`;

const StyledTabButton = styled.button<{ $isCurrent: boolean }>`
  border: none;
  border-radius: 0;
  background-color: ${(props) => (props.$isCurrent ? "black" : "white")};
  font-size: 16px;
  color: ${(props) => (props.$isCurrent ? "white" : "black")};
  border: 3px solid black;
  border-bottom: none;
  padding: 8px;
  text-decoration: ${(props) => (props.$isCurrent ? "underline" : "none")};
  cursor: pointer;
  min-width: 100px;

  &:hover {
    text-decoration: underline wavy;
  }
`;

const StyledTabPanel = styled.div`
  border: 3px solid black;
  padding: 16px;
`;

type Props = {
  tabs: Tab[];
};
export const NavigationTabs = ({ tabs }: Props) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [focusedTabIndex, setFocusedTabIndex] = useState(0);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const PANEL_ID = "navigation-tab-panel";

  const { name: currentTabName, panelContent: currentPanelContent } =
    useMemo(() => {
      return tabs[currentTabIndex];
    }, [currentTabIndex, tabs]);

  const currentTabId = useMemo(() => {
    return getTabId(currentTabName);
  }, [currentTabName]);

  const handleArrowKeys: React.KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setFocusedTabIndex((focusedTabIndex) => {
          const newIndex =
            focusedTabIndex > 0 ? focusedTabIndex - 1 : tabs.length - 1;
          tabRefs.current[newIndex]?.focus();
          return newIndex;
        });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setFocusedTabIndex((focusedTabIndex) => {
          const newIndex =
            focusedTabIndex === tabs.length - 1 ? 0 : focusedTabIndex + 1;
          tabRefs.current[newIndex]?.focus();
          return newIndex;
        });
      }
    },
    [tabs],
  );

  const handleBlur: React.FocusEventHandler = (event) => {
    if (!tabListRef.current?.contains(event.relatedTarget)) {
      setFocusedTabIndex(currentTabIndex);
    }
  };

  const setTabRef = useCallback((index: number) => {
    return (el: HTMLButtonElement | null) => {
      tabRefs.current[index] = el;
    };
  }, []);

  const onSelectTab = (index: number) => {
    setCurrentTabIndex(index);
    setFocusedTabIndex(index);
  };

  return (
    <div>
      <StyledTabButtonHolder
        role="tablist"
        ref={tabListRef}
        onBlur={handleBlur}
      >
        {tabs.map(({ name }, index) => {
          const isCurrent = index === currentTabIndex;
          return (
            <StyledTabButton
              id={getTabId(name)}
              key={name}
              ref={setTabRef(index)}
              role="tab"
              aria-selected={isCurrent}
              $isCurrent={isCurrent}
              tabIndex={index === focusedTabIndex ? 0 : -1}
              aria-controls={PANEL_ID}
              onClick={() => onSelectTab(index)}
              onKeyDown={handleArrowKeys}
            >
              {name}
            </StyledTabButton>
          );
        })}
      </StyledTabButtonHolder>
      <StyledTabPanel
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={currentTabId}
      >
        {currentPanelContent}
      </StyledTabPanel>
    </div>
  );
};
