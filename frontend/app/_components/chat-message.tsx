import type { UIMessage } from "ai";
import { Streamdown } from "streamdown";

import { ChatBubble } from "./chat-bubble";
import { ChatToolStatus } from "./chat-tool-status";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const role = message.role === "user" ? "user" : "assistant";

  return (
    <>
      {message.parts.map((part, index) => {
        const key = `${message.id}-${index}`;

        if (part.type === "text") {
          if (!part.text.trim()) {
            return null;
          }

          return (
            <ChatBubble key={key} role={role}>
              {role === "user" ? (
                part.text
              ) : (
                <Streamdown className="[&_ol]:pl-4 [&_ul]:pl-4">
                  {part.text}
                </Streamdown>
              )}
            </ChatBubble>
          );
        }

        if (part.type.startsWith("tool-") && "state" in part) {
          return (
            <ChatToolStatus
              key={key}
              toolType={part.type}
              isDone={part.state === "output-available"}
            />
          );
        }

        return null;
      })}
    </>
  );
}
