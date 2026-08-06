// This app never ships with, stores, or transmits an API key of its
// own. The user pastes their own key into the AI panel; it's kept
// only in memory (or localStorage if they opt in) on their machine
// and sent directly from their browser to the chosen provider. That
// also means the key is visible in this browser's network requests —
// fine for personal/local use, but do not ship a build with a key
// baked in, and don't deploy this as-is for other people to share.

export const PROVIDERS = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    defaultModel: 'claude-sonnet-5',
    keyPlaceholder: 'sk-ant-...',
    keyHelpUrl: 'https://console.anthropic.com',
    notes: 'Pay-as-you-go. Not covered by a Claude.ai subscription.',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    // OpenRouter's free-model roster rotates weekly — this is just a
    // reasonable starting point, not a guarantee it's still free or
    // still live. Always check openrouter.ai/models?max_price=0 for
    // what's currently free before relying on a specific slug.
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    keyPlaceholder: 'sk-or-v1-...',
    keyHelpUrl: 'https://openrouter.ai/models?max_price=0',
    notes:
      'Has genuinely free (:free) models — no card needed — but they\u2019re rate-limited ' +
      '(around 20 requests/min, 50\u20131000/day) and the free roster changes often.',
  },
};

async function callAnthropic(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Anthropic request failed (${res.status}).`);
  }
  const data = await res.json();
  return data.content?.map((b) => b.text || '').join('\n').trim() || '';
}

async function callOpenRouter(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      // Optional, but lets OpenRouter attribute the request instead of
      // showing up as anonymous in their dashboard.
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'README AI Studio',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || `OpenRouter request failed (${res.status}).`;
    // Free-tier models frequently 429 under load — give a clearer hint.
    if (res.status === 429) {
      throw new Error(`${msg} (Free-tier models rate-limit quickly — wait a bit or try a different :free model.)`);
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function callModel(provider, apiKey, model, systemPrompt, userPrompt) {
  if (!apiKey?.trim()) throw new Error('Add an API key first.');
  if (provider === 'openrouter') return callOpenRouter(apiKey, model, systemPrompt, userPrompt);
  return callAnthropic(apiKey, model, systemPrompt, userPrompt);
}

export async function generateDescription(provider, apiKey, model, { projectName, tagline, techStack }) {
  const system =
    'You write concise, specific one-paragraph README descriptions for software projects. ' +
    'No marketing fluff, no emoji, 2-3 sentences, mention the real tech stack given.';
  const prompt = `Project name: ${projectName}\nCurrent tagline: ${tagline || '(none)'}\nTech stack: ${techStack.join(', ') || 'unknown'}\n\nWrite the "About" paragraph.`;
  return callModel(provider, apiKey, model, system, prompt);
}

export async function generateFeatures(provider, apiKey, model, { projectName, description, techStack }) {
  const system =
    'You suggest a realistic feature list for a software README based on its description and tech stack. ' +
    'Return 5-8 short bullet points, one per line, no numbering, no dashes, just the feature text. Be specific, not generic.';
  const prompt = `Project: ${projectName}\nDescription: ${description}\nTech stack: ${techStack.join(', ') || 'unknown'}\n\nList the likely features.`;
  const text = await callModel(provider, apiKey, model, system, prompt);
  return text
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * One-shot "generate everything" call. Fills in every AI-appropriate
 * field (tagline, description, features, roadmap, contributing) from
 * whatever project context is available. Deliberately does NOT touch
 * badges/install/usage commands — those stay derived from package.json.
 */
export async function generateFullReadme(provider, apiKey, model, context) {
  const { projectName, tagline, techStack, folderTree, existingDescription } = context;

  const system =
    'You write GitHub README content for software projects. ' +
    'Respond with ONLY a raw JSON object, no markdown fences, no commentary, matching exactly this shape:\n' +
    '{"tagline": string, "description": string, "features": string[], "roadmap": string[], "contributing": string}\n' +
    '- tagline: one short punchy line (under 12 words).\n' +
    '- description: 2-3 sentences, specific, no marketing fluff, no emoji.\n' +
    '- features: 5-8 short bullet strings, specific to the given tech stack and folder structure, not generic filler.\n' +
    '- roadmap: 3-5 short plausible next-step items.\n' +
    '- contributing: 2-3 sentences inviting pull requests, mentioning opening an issue first for large changes.';

  const prompt = [
    `Project name: ${projectName || 'Unnamed project'}`,
    tagline ? `Existing tagline: ${tagline}` : null,
    existingDescription ? `Existing description: ${existingDescription}` : null,
    `Tech stack: ${techStack.join(', ') || 'unknown'}`,
    folderTree ? `Folder structure:\n${folderTree}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const raw = await callModel(provider, apiKey, model, system, prompt);
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      'The model didn\u2019t return valid JSON (this happens more often on small free models). Try again, or switch to a stronger model.'
    );
  }

  return {
    tagline: parsed.tagline || '',
    description: parsed.description || '',
    features: Array.isArray(parsed.features) ? parsed.features : [],
    roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [],
    contributing: parsed.contributing || '',
  };
}