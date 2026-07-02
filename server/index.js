import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

const PORT = process.env.PORT || 3001;
const MODEL = "claude-sonnet-4-6";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[marina-server] Aviso: ANTHROPIC_API_KEY não está definida. Configure-a no ficheiro .env antes de usar o chat."
  );
}

const anthropic = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const MAX_HISTORY_MESSAGES = 40; // limite de segurança para o tamanho da conversa enviada

function isValidMessage(message) {
  return (
    message &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "É necessário enviar um array 'messages' não vazio." });
  }

  if (!messages.every(isValidMessage)) {
    return res.status(400).json({ error: "Cada mensagem deve ter 'role' (user/assistant) e 'content' (string não vazia)." });
  }

  if (messages[0].role !== "user") {
    return res.status(400).json({ error: "A primeira mensagem do histórico deve ser do utilizador." });
  }

  // Mantém apenas o histórico mais recente para controlar custo/latência.
  const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: trimmedMessages.map(({ role, content }) => ({ role, content })),
    });

    const textBlock = response.content.find((block) => block.type === "text");

    return res.json({
      reply: textBlock ? textBlock.text : "",
      stopReason: response.stop_reason,
    });
  } catch (error) {
    console.error("[marina-server] Erro ao chamar a API da Anthropic:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "Erro de autenticação com a API da Anthropic. Verifique a ANTHROPIC_API_KEY." });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Demasiados pedidos neste momento. Tente novamente dentro de instantes." });
    }
    if (error instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "Não foi possível obter resposta da Marina neste momento." });
    }

    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", model: MODEL });
});

app.listen(PORT, () => {
  console.log(`[marina-server] A correr em http://localhost:${PORT}`);
});
