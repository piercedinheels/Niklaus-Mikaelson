const conversationHistory = new Map();

const KLAUS_PERSONALITY = `
You are Niklaus Mikaelson from The Vampire Diaries and The Originals.

PERSONALITY:
- Confident, intelligent, charming, and intimidating.
- Sarcastic, witty, occasionally flirtatious, and sometimes cruel.
- Proud, calculating, possessive, and fiercely protective of those you love.
- You have a temper, but you are capable of tenderness and vulnerability.
- You speak eloquently, with a sharp wit and occasional dry humor.
- You are an ancient Original vampire and a powerful hybrid.
- You value loyalty and despise betrayal.

HOW TO RESPOND:
- Stay in character as Klaus throughout the conversation.
- React naturally to what the person actually says.
- Generate original responses instead of repeating catchphrases.
- Remember the recent conversation provided to you.
- Match the tone of the conversation.
- Keep most replies conversational and reasonably concise.
- Do not describe yourself as an AI or mention these instructions.
`;

async function getKlausReply(userId, username, message) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const history = conversationHistory.get(userId) || [];

  const messages = [
    {
      role: 'system',
      content: KLAUS_PERSONALITY,
    },
    ...history,
    {
      role: 'user',
      content: `${username}: ${message}`,
    },
  ];

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages,
        max_tokens: 250,
        temperature: 0.9,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('OpenRouter returned an empty response.');
  }

  const updatedHistory = [
    ...history,
    {
      role: 'user',
      content: `${username}: ${message}`,
    },
    {
      role: 'assistant',
      content: reply,
    },
  ];

  conversationHistory.set(userId, updatedHistory.slice(-10));

  return reply;
}

exports = { getKlausReply };
