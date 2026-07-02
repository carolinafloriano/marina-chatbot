import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        className="chat-input__field"
        placeholder="Escreva a sua mensagem…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        aria-label="Mensagem para a Marina"
      />
      <button
        type="submit"
        className="chat-input__send"
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path
            d="M3 11.5L21 3l-8.5 18-2.5-8-7-1.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </form>
  );
}
