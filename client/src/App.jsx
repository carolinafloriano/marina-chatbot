import { useCallback, useState } from "react";
import Header from "./components/Header.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ChatInput from "./components/ChatInput.jsx";
import "./App.css";

let nextId = 1;
const makeId = () => nextId++;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    async (text) => {
      const userMessage = { id: makeId(), role: "user", content: text };

      // O histórico completo (incluindo a nova mensagem) é mantido no estado
      // React e enviado por inteiro à API a cada pedido, para preservar o
      // contexto da conversa entre turnos.
      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      setIsTyping(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedHistory.map(({ role, content }) => ({ role, content })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Não foi possível obter resposta.");
        }

        setMessages((current) => [
          ...current,
          { id: makeId(), role: "assistant", content: data.reply },
        ]);
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: makeId(),
            role: "assistant",
            content:
              "Desculpe, não consegui responder neste momento. Tente novamente em instantes ou contacte-nos em geral@atlanticotours.pt.",
            isError: true,
          },
        ]);
        console.error(error);
      } finally {
        setIsTyping(false);
      }
    },
    [messages]
  );

  const handleNewConversation = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="app-shell">
      <div className="chat-container">
        <Header onNewConversation={handleNewConversation} />
        <main className="chat-body">
          <ChatWindow messages={messages} isTyping={isTyping} onSuggestionSelect={sendMessage} />
          <ChatInput onSend={sendMessage} disabled={isTyping} />
        </main>
      </div>
    </div>
  );
}
