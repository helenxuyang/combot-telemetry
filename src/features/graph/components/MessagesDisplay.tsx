import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useParsedMessages } from "../../../messagesStore";
import { TauriTelemetryMessage } from "../../../messageTypes";
import { stringifyMessage } from "../../../messageUtils";
import { ALL_ESC_IDs, EscId } from "../../../robot";
import { CondensedButton, SelectableCondensedButton } from "../../../styles";

const Holder = styled.div`
  overflow-y: auto;
`;

const FilterHolder = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EscFilterButton = styled(SelectableCondensedButton)`
  padding: 4px 8px;
`;

const MessageHolder = styled.div`
  gap: 8px;
  font-size: 12px;
  text-align: left;

  p {
    margin-top: 8px;
  }
`;

const Message = styled.p<{ $highlight: Boolean }>`
  ${({ $highlight }) =>
    $highlight &&
    css`
      background-color: yellow;
    `}
`;

const constructMessageId = (escId: string, timestamp: string) => {
  return `${escId}-${timestamp}`;
};

const getDataMessageId = (message: TauriTelemetryMessage) => {
  if ("escId" in message && "timestamp" in message) {
    return constructMessageId(message.escId, String(message.timestamp));
  }
  return null;
};

export const MessagesDisplay = () => {
  // TODO: may need to add pagination when we have a TON of messages
  const parsedMessages = useParsedMessages();
  const [escFilters, setEscFilters] = useState<Record<EscId, boolean>>(
    ALL_ESC_IDs.reduce(
      (acc, id) => ({ ...acc, [id]: true }),
      {} as Record<EscId, boolean>,
    ),
  );
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickPoint = (event: Event) => {
      const clickPointEvent = event as CustomEvent;
      const { escId, timestamp } = clickPointEvent.detail;
      const messageId = constructMessageId(escId, timestamp);
      if (messageId) {
        setHighlightedMessageId(messageId);
        const element = document.getElementById(messageId);
        if (element) {
          element.scrollIntoView();
        }
      }
    };
    window.addEventListener("clickPoint", handleClickPoint);
    return () => {
      window.removeEventListener("clickPoint", handleClickPoint);
    };
  }, []);

  return (
    <Holder ref={holderRef}>
      <h2>Messages</h2>
      <FilterHolder>
        <strong>Filters: </strong>
        {(Object.keys(escFilters) as EscId[]).map((id) => (
          <EscFilterButton
            key={id}
            $isSelected={escFilters[id]}
            onClick={() => {
              setEscFilters((filters) => ({ ...filters, [id]: !filters[id] }));
            }}
          >
            {id}
          </EscFilterButton>
        ))}
        <CondensedButton onClick={() => setShowRaw((show) => !show)}>
          {showRaw ? "Hide raw" : "Show raw"}
        </CondensedButton>
      </FilterHolder>
      <MessageHolder>
        {parsedMessages
          .filter((message) => {
            if ("escId" in message) {
              return escFilters[message.escId];
            }
            return true;
          })
          .map((message) => {
            const id = getDataMessageId(message) ?? undefined;
            return (
              <Message
                $highlight={id === highlightedMessageId}
                id={id}
                key={message.uuid}
              >
                {stringifyMessage(message, showRaw)}
              </Message>
            );
          })}
      </MessageHolder>
    </Holder>
  );
};
