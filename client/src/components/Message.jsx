export default function Message({ role, content, isError }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--assistant"}`}>
      {!isUser && (
        <div className="avatar avatar--small" aria-hidden="true">
          🌊
        </div>
      )}
      <div
        className={[
          "bubble",
          isUser ? "bubble--user" : "bubble--assistant",
          isError ? "bubble--error" : "",
        ].join(" ").trim()}
      >
        {content}
      </div>
    </div>
  );
}
