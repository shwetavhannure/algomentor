import axios from 'axios';

// ---------------------------------------------------------------------------
// Providers and models
// A provider is "configured" when its API key is set in backend/.env.
// If the chosen model fails (retired, rate limited, key problem), the next
// available model is tried automatically.
// ---------------------------------------------------------------------------
const PLACEHOLDER = /^(your_|put_|change_this)/i;

const PROVIDERS = {
  groq: {
    label: 'Groq',
    keyEnv: 'GROQ_API_KEY',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    style: 'openai',
  },
  openai: {
    label: 'OpenAI',
    keyEnv: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/chat/completions',
    style: 'openai',
  },
  anthropic: {
    label: 'Anthropic',
    keyEnv: 'ANTHROPIC_API_KEY',
    url: 'https://api.anthropic.com/v1/messages',
    style: 'anthropic',
  },
};

// Edit this list (or use EXTRA_MODELS in .env) when providers retire models.
const BASE_CATALOG = [
  { provider: 'groq', id: 'llama-3.1-8b-instant' },
  { provider: 'groq', id: 'openai/gpt-oss-20b' },
];

const MAX_OUTPUT_TOKENS = 3000; // room for a full hint (and gpt-oss reasoning tokens)

function apiKey(provider) {
  const v = (process.env[PROVIDERS[provider].keyEnv] || '').trim();
  return v && !PLACEHOLDER.test(v) ? v : '';
}

function fullCatalog() {
  // EXTRA_MODELS=openai:gpt-4.1-mini,groq:some-new-model
  const extra = (process.env.EXTRA_MODELS || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const [provider, ...rest] = x.split(':');
      return { provider: provider.trim().toLowerCase(), id: rest.join(':').trim() };
    })
    .filter((m) => PROVIDERS[m.provider] && m.id);

  const seen = new Set();
  return [...BASE_CATALOG, ...extra].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

function usableModels() {
  return fullCatalog().filter((m) => apiKey(m.provider));
}

export function getModelInfo() {
  const usable = usableModels();
  const list = usable.length ? usable : fullCatalog().filter((m) => m.provider === 'groq');
  const wanted = (process.env.DEFAULT_MODEL || process.env.GROQ_MODEL || '').trim();
  const defaultModel = list.find((m) => m.id === wanted)?.id || list[0]?.id || '';
  return {
    models: list.map((m) => m.id),
    details: list.map((m) => ({ id: m.id, provider: m.provider, label: PROVIDERS[m.provider].label })),
    defaultModel,
    configured: usable.length > 0,
  };
}

function buildOrder(requested) {
  const usable = usableModels();
  const { defaultModel } = getModelInfo();
  const first = usable.find((m) => m.id === requested) || usable.find((m) => m.id === defaultModel);
  return [first].filter(Boolean); // no fallback: only the selected model answers
}

function assertAiConfigured() {
  if (usableModels().length === 0) {
    const err = new Error(
      'AI is not configured. Add GROQ_API_KEY (or OPENAI_API_KEY / ANTHROPIC_API_KEY) to backend/.env and restart the backend.'
    );
    err.statusCode = 503;
    throw err;
  }
}

async function callModel(entry, systemPrompt, userPrompt) {
  const provider = PROVIDERS[entry.provider];
  const key = apiKey(entry.provider);

  if (provider.style === 'anthropic') {
    const res = await axios.post(
      provider.url,
      {
        model: entry.id,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      },
      {
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        timeout: 45000,
      }
    );
    if (res.data?.stop_reason === 'max_tokens') throw new Error('response cut off (token limit)');
    return (res.data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  }

  const body = {
    model: entry.id,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: MAX_OUTPUT_TOKENS,
  };
  // gpt-oss models "think" first and the thinking uses up the token budget,
  // which cuts the visible answer short. Keep the thinking small.
  if (entry.id.startsWith('openai/gpt-oss')) body.reasoning_effort = 'low';

  const res = await axios.post(provider.url, body, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    timeout: 45000,
  });
  const choice = res.data?.choices?.[0];
  if (choice?.finish_reason === 'length') throw new Error('response cut off (token limit)');
  return choice?.message?.content || '';
}

function friendlyError(e, entry) {
  const status = e.response?.status;
  const msg = e.response?.data?.error?.message || e.response?.data?.error || e.message;
  const where = PROVIDERS[entry.provider].label;
  let text;
  if (status === 429) text = `${entry.id} hit its rate/daily limit. Try again later or pick the other model.`;
  else if (status === 401 || status === 403) text = `${where} rejected the API key. Check it in backend/.env.`;
  else if (status === 404) text = 'The selected AI model is not available. Pick another model.';
  else text = `AI request failed: ${typeof msg === 'string' ? msg : 'unknown error'}`;
  const err = new Error(text);
  err.statusCode = status === 429 ? 429 : 502;
  return err;
}

export async function chatCompletion(systemPrompt, userPrompt, requestedModel) {
  assertAiConfigured();
  const [entry] = buildOrder(requestedModel);

  try {
    const text = await callModel(entry, systemPrompt, userPrompt);
    if (!text.trim()) throw new Error('empty response');
    return { text, modelUsed: entry.id };
  } catch (e) {
    console.warn(`[ai] ${entry.id} failed:`, e.response?.status || e.message, e.response?.data?.error?.message || '');
    throw friendlyError(e, entry);
  }
}

function hintSystemPrompt(level) {
  const rules = [
    '',
    'Level 1: Give a single short nudge in 1–2 sentences. No algorithm name, no code.',
    'Level 2: Explain the approach and data structure to use. No code.',
    'Level 3: Give numbered pseudocode only. No full code in a programming language.',
    'Level 4: Give the full solution in the user\'s language with a short explanation.',
  ];
  return `You are AlgoMentor, a DSA practice mentor. ${rules[level]}
Include the problem context mentally. If the user's code has a specific mistake, point it out.
Respond in Markdown only. Do not give more hint than the level allows.`;
}

function hintUserPrompt(statement, code, language, level) {
  return `Problem statement:
${statement}

User's language: ${language}

User's current code:
\`\`\`
${code || '(empty)'}
\`\`\`

Generate hint level ${level}.`;
}

export async function generateHint(statement, code, language, level, model) {
  const systemPrompt = hintSystemPrompt(level);
  const userPrompt = hintUserPrompt(statement, code, language, level);
  return chatCompletion(systemPrompt, userPrompt, model);
}

export async function analyzeComplexity(code, language, model) {
  const systemPrompt = `You estimate time and space complexity of code.
Reply with JSON only, no markdown fences: {"time":"O(...)","space":"O(...)","note":"one short reason"}`;
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  const { text, modelUsed } = await chatCompletion(systemPrompt, userPrompt, model);

  let parsed;
  try {
    const trimmed = text.trim().replace(/^```json?\s*|\s*```$/gi, '');
    parsed = JSON.parse(trimmed);
  } catch {
    const err = new Error('AI returned invalid complexity JSON. Try again.');
    err.statusCode = 502;
    throw err;
  }

  return {
    complexity: {
      time: String(parsed.time || ''),
      space: String(parsed.space || ''),
      note: String(parsed.note || ''),
    },
    modelUsed,
  };
}