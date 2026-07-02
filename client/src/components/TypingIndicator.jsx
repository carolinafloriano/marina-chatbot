export default function TypingIndicator() {
  return (
    <div className="message-row message-row--assistant">
      <div className="avatar avatar--small" aria-hidden="true">
        🌊
      </div>
      <div className="bubble bubble--assistant bubble--typing" aria-live="polite" aria-label="Marina está a escrever">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
