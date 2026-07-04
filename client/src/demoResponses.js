// Respostas simuladas para o modo demo do frontend — usadas quando a app
// corre sem backend disponível (ex. GitHub Pages), para que a interface seja
// sempre testável mesmo sem servidor nem chave de API.
//
// Isto NÃO é o comportamento real da Marina — é apenas correspondência de
// palavras-chave, sem qualquer modelo de linguagem por trás. É uma cópia
// deliberada de server/demoResponses.js, mantida em separado para que o
// client possa correr de forma totalmente estática, sem depender do backend.

const RULES = [
  {
    keywords: ["destino", "destinos", "onde", "lugares", "sítios", "sitios", "destination"],
    pt: "Temos passeios em quatro destinos: Lisboa (Rio Tejo), Cascais (pôr do sol), Setúbal (observação de golfinhos) e Algarve (grutas de Benagil). Sobre qual gostaria de saber mais?",
    en: "We run tours in four destinations: Lisbon (Tagus River), Cascais (sunset cruise), Setúbal (dolphin watching), and the Algarve (Benagil caves). Which one would you like to know more about?",
  },
  {
    keywords: ["reserva", "reservar", "marcar", "booking", "book"],
    pt: "Pode reservar no nosso site, na app, ou por telefone (+351 210 000 000). O pagamento é feito no momento da reserva e o ponto de encontro é enviado por email 24h antes do passeio.",
    en: "You can book on our website, our app, or by phone (+351 210 000 000). Payment is made at booking time, and the exact meeting point is emailed to you 24h before the tour.",
  },
  {
    keywords: ["preço", "preços", "preco", "precos", "custo", "custa", "valor", "price", "cost"],
    pt: "Os preços variam por destino: Lisboa €35, Cascais €45, Setúbal €55, Algarve €40 (por adulto). Charters privados a partir de €300. Quer os preços para crianças também?",
    en: "Prices vary by destination: Lisbon €35, Cascais €45, Setúbal €55, Algarve €40 (per adult). Private charters start at €300. Would you like child pricing too?",
  },
  {
    keywords: ["cancelamento", "cancelar", "reembolso", "cancel", "refund"],
    pt: "Cancelamento gratuito até 48h antes (reembolso total). Entre 48h–24h: 50% de reembolso. Menos de 24h: sem reembolso. Em caso de mau tempo, oferecemos sempre reagendamento ou reembolso total.",
    en: "Free cancellation up to 48h before (full refund). Between 48h–24h: 50% refund. Less than 24h: no refund. In case of bad weather, we always offer free rescheduling or a full refund.",
  },
  {
    keywords: ["crianç", "criança", "kids", "child", "filho"],
    pt: "Sim, todos os passeios são adequados para crianças, com coletes salva-vidas em tamanho infantil a bordo. Os preços para crianças (4–12 anos) rondam os €20–€35 consoante o destino.",
    en: "Yes, all tours are child-friendly, with child-sized life jackets on board. Prices for children (4–12) range from around €20–€35 depending on the destination.",
  },
  {
    keywords: ["olá", "ola", "boa tarde", "boa noite", "bom dia", "hello", "hi", "hey"],
    pt: "Olá! 👋 Sou a Marina, da Atlântico Tours. Em que posso ajudar? Posso falar sobre os nossos destinos, preços, reservas ou política de cancelamento.",
    en: "Hi there! 👋 I'm Marina from Atlântico Tours. How can I help? I can tell you about our destinations, prices, bookings or cancellation policy.",
  },
];

const FALLBACK = {
  pt: "Essa é uma boa pergunta! (Esta é uma resposta simulada do modo demo — sem ligação real à API. Pergunte sobre destinos, preços, reservas ou cancelamentos para ver mais exemplos.)",
  en: "That's a great question! (This is a simulated demo-mode reply — not connected to the real API. Ask about destinations, prices, bookings, or cancellations to see more examples.)",
};

function detectLanguage(text) {
  const englishHints = /\b(the|what|how|where|price|cost|book|hello|hi|cancel|refund|thanks|please)\b/i;
  return englishHints.test(text) ? "en" : "pt";
}

export function getDemoReply(lastUserMessage) {
  const text = lastUserMessage.toLowerCase();
  const lang = detectLanguage(text);

  const match = RULES.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  return match ? match[lang] : FALLBACK[lang];
}
