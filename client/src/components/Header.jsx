export default function Header({ onNewConversation }) {
  return (
    <header className="app-header">
      <div className="app-header__identity">
        <div className="avatar avatar--header" aria-hidden="true">
          🌊
        </div>
        <div>
          <h1 className="app-header__title">Marina</h1>
          <p className="app-header__subtitle">Atlântico Tours · assistente virtual</p>
        </div>
      </div>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={onNewConversation}
        aria-label="Começar nova conversa"
      >
        Nova conversa
      </button>
    </header>
  );
}
