import { useCallback, useState } from "react";
import Header from "./components/Header.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ChatInput from "./components/ChatInput.jsx";
import { getDemoReply } from "./demoResponses.js";
import "./App.css";

let nextId = 1;
const makeId = () => nextId++;

// Build estático (ex. GitHub Pages) não tem backend disponível para chamar
// /api/chat, por isso usa-se o modo demo embutido no próprio frontend.
// Definido em tempo de build via VITE_DEMO_MODE=true (ver .github/workflows).
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

async function fetchDemoReply(updatedHistory) {
  const lastUserMessage = [...updatedHistory].reverse().find((m) => m.role === "user");
  const delay = 500 + Math.random() * 700; // simula latência real para o indicador "a escrever"
  await new Promise((resolve) => setTimeout(resolve, delay));
  return getDemoReply(lastUserMessage?.content ?? "");
}

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
        let reply;

        if (DEMO_MODE) {
          reply = await fetchDemoReply(updatedHistory);
        } else {
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

          reply = data.reply;
        }

        setMessages((current) => [
          ...current,
          { id: makeId(), role: "assistant", content: reply },
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
