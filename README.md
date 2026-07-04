# Marina — Chatbot de Atendimento (Atlântico Tours)

Aplicação de demonstração: um chatbot de apoio ao cliente para uma empresa fictícia de turismo náutico ("Atlântico Tours"), construído com **React** no frontend e um **backend Express** que serve de proxy seguro para a **API da Anthropic** (modelo `claude-sonnet-4-6`).

A assistente chama-se **Marina**, responde em português ou inglês consoante o idioma do utilizador, e conhece apenas a informação (fictícia) definida no *system prompt* do backend.

🔗 **Demo ao vivo:** https://carolinafloriano.github.io/marina-chatbot/ (versão estática, em modo demo — respostas simuladas, sem ligação real à API)

---

## Arquitetura

```
marina-chatbot/
├── server/              Backend Express — proxy para a API da Anthropic
│   ├── index.js         Endpoint POST /api/chat + validação + tratamento de erros
│   ├── systemPrompt.js  Definição completa do comportamento da Marina
│   └── .env.example
└── client/               Frontend React (Vite)
    └── src/
        ├── App.jsx              Estado da conversa + chamada à API
        ├── demoResponses.js     Modo demo embutido (usado no build para GitHub Pages)
        └── components/
            ├── Header.jsx
            ├── ChatWindow.jsx
            ├── Message.jsx
            ├── TypingIndicator.jsx
            ├── SuggestedQuestions.jsx
            └── ChatInput.jsx
```

**Por que existe um backend?** A chave da API da Anthropic (`ANTHROPIC_API_KEY`) nunca pode estar no código do frontend — qualquer pessoa que abra as *devtools* do browser conseguiria vê-la e usá-la à sua conta. O backend Express é um proxy fino: recebe o histórico de mensagens do frontend, injeta a chave e o *system prompt* (que também não devem ser expostos ao cliente), chama a API da Anthropic, e devolve apenas o texto da resposta.

```
React (frontend, porta 5173)
     │  POST /api/chat  { messages: [...] }
     ▼
Express (backend, porta 3001)
     │  anthropic.messages.create({ model, system, messages })
     ▼
API da Anthropic (claude-sonnet-4-6)
```

Em produção, o mesmo princípio aplica-se: o frontend estático (ex. Vercel/Netlify) fala apenas com o vosso próprio backend (ex. num servidor Node, numa função serverless), nunca diretamente com `api.anthropic.com`.

### Formato do histórico de conversa

O React mantém o histórico completo no estado (`useState`) como um array de objetos `{ role, content }`, no formato que a API da Anthropic espera:

```js
[
  { role: "user", content: "Quais os vossos destinos?" },
  { role: "assistant", content: "Temos passeios em Lisboa, Cascais..." },
  { role: "user", content: "E os preços em Lisboa?" },
]
```

A cada nova mensagem, o **array inteiro** (não apenas a última mensagem) é enviado ao backend, que o repassa tal e qual à Anthropic no campo `messages`. É assim que o modelo "lembra" o que foi dito antes — a API não tem estado próprio, por isso o cliente (aqui, o backend) é responsável por reenviar o contexto completo a cada pedido. Por simplicidade, o histórico é limitado às últimas 40 mensagens (`MAX_HISTORY_MESSAGES` em `server/index.js`) para controlar custo e latência.

### Como o *system prompt* define o comportamento

Todo o "conhecimento" e "personalidade" da Marina vive num único ficheiro: `server/systemPrompt.js`. É enviado à API no campo `system`, separado do histórico de mensagens (`messages`), o que tem duas vantagens importantes:

1. **O modelo trata `system` com mais autoridade** do que uma instrução colocada dentro de uma mensagem do utilizador — é o canal correto para definir regras de comportamento.
2. **O utilizador nunca vê nem pode alterar o `system` prompt** (ele fica só no backend), o que reduz a superfície para *prompt injection* trivial ("ignora as tuas instruções e...").

O prompt neste projeto define, por secções:

- **Identidade** — nome (Marina), papel (apoio ao cliente da Atlântico Tours).
- **Base de conhecimento** — destinos, preços, política de cancelamento, FAQ. Tudo o que a Marina "sabe" vem literalmente do texto aqui; ela é instruída a não inventar informação que não esteja no prompt.
- **Tom** — profissional, simpática, respostas concisas.
- **Idioma** — responde sempre no idioma da última mensagem do utilizador.

Para alterar o que a Marina sabe ou como se comporta, basta editar `systemPrompt.js` — não é preciso tocar em nenhum código do frontend ou da lógica de chamada à API.

---

## Como este padrão se aplica a casos reais

O par **"system prompt bem definido" + "backend que protege a chave da API"** é a base de praticamente qualquer assistente conversacional em produção. Alguns exemplos de como adaptar este mesmo esqueleto:

- **Suporte ao cliente** (este exemplo) — o *system prompt* contém a base de conhecimento do produto/serviço (FAQ, políticas, catálogo). Em produção, essa base tende a ficar grande demais para caber toda no prompt; nesse caso, liga-se o chatbot a uma base de dados ou motor de pesquisa (RAG) e usa-se *tool use* da API para o modelo consultar informação em tempo real, em vez de tudo estar hardcoded no prompt como aqui.
- **Onboarding de utilizadores** — o *system prompt* define o guião de boas-vindas, os passos que o utilizador deve seguir, e que perguntas fazer para recolher informação (ex. preferências, objetivos). O histórico de conversa permite ao assistente lembrar-se de respostas anteriores do utilizador durante o processo.
- **FAQ automatizado** — variante mais restrita deste projeto: o *system prompt* é ainda mais rígido ("responde apenas com base no texto abaixo; se não souberes, diz que vais escalar para um humano"), para minimizar o risco de o modelo inventar respostas fora do âmbito.

Em todos os casos, o desenho mantém-se: **o frontend nunca fala diretamente com a API do modelo**, o **system prompt concentra o conhecimento e as regras de comportamento** num único sítio fácil de rever e atualizar, e o **histórico de mensagens é reenviado a cada pedido** para dar continuidade à conversa.

---

## Como correr localmente

### 1. Backend

```bash
cd server
cp .env.example .env
# edite o .env e coloque a sua ANTHROPIC_API_KEY
npm install
npm run dev
```

O backend arranca em `http://localhost:3001`.

#### Testar sem chave de API nem custos (modo demo)

Chamadas reais à API da Anthropic são pagas (embora muito baratas para testes — normalmente frações de cêntimo por mensagem). Se quiser testar toda a interface sem criar conta/chave nem gastar nada, defina no `.env`:

```
DEMO_MODE=true
```

Com isto, o backend deixa de chamar a Anthropic e responde com texto simulado (correspondência simples de palavras-chave em `server/demoResponses.js`), mantendo o mesmo atraso realista para o indicador "a escrever". Serve para validar o fluxo da conversa, a interface e o comportamento de erro — não reflete a qualidade real das respostas da Marina. Para usar o modelo real, basta voltar a pôr `DEMO_MODE=false` (ou remover a linha) e configurar a `ANTHROPIC_API_KEY`.

### 2. Frontend

Noutro terminal:

```bash
cd client
npm install
npm run dev
```

O frontend arranca em `http://localhost:5173` e encaminha automaticamente os pedidos `/api/*` para o backend (ver `vite.config.js`).

Abra `http://localhost:5173` no browser e converse com a Marina.

---

## Notas de segurança

- A `ANTHROPIC_API_KEY` só existe no ambiente do backend (`server/.env`, que não é commitado).
- O `system prompt` só existe no backend — o frontend nunca o recebe.
- O endpoint `/api/chat` valida a forma do payload recebido (roles válidas, conteúdo não vazio, primeira mensagem do utilizador) antes de o repassar à API.
