import { useEffect, useRef } from "react";
import Message from "./Message.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import SuggestedQuestions from "./SuggestedQuestions.jsx";

export default function ChatWindow({ messages, isTyping, onSuggestionSelect }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <SuggestedQuestions onSelect={onSuggestionSelect} disabled={isTyping} />
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            role={message.role}
            content={message.content}
            isError={message.isError}
          />
        ))
      )}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
