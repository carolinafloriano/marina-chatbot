const SUGGESTIONS = [
  "Quais os vossos destinos?",
  "Como funciona a reserva?",
  "Quais os preços?",
  "Qual a política de cancelamento?",
];

export default function SuggestedQuestions({ onSelect, disabled }) {
  return (
    <div className="suggestions">
      <p className="suggestions__title">Olá! 👋 Sou a Marina. Em que posso ajudar hoje?</p>
      <div className="suggestions__list">
        {SUGGESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            className="suggestion-chip"
            onClick={() => onSelect(question)}
            disabled={disabled}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
