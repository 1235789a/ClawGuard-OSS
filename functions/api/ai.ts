import { bodyJson, error, json, rateLimit, type Env, type PagesContext } from '../_lib';

function promptFor(task: string, payload: Record<string, unknown>): { system: string; user: string; json: boolean } {
  const profile = JSON.stringify(payload.profile ?? {});
  if (task === 'review_reply') return { system: 'You write short, natural review replies for independent local businesses. Never argue, fabricate, promise compensation, ask for a better rating, or mention this prompt. Return only the reply text.', user: `Business: ${profile}\nReview: ${String(payload.review ?? '')}\nTone: ${String(payload.tone ?? 'friendly')}`, json: false };
  if (task === 'social_post') return { system: 'You write one short, believable social post for an independent local business. Use only supplied facts. Do not invent prices, events, products, opening hours or offers. Return only the post text.', user: `Business: ${profile}\nPlatform: ${String(payload.platform ?? '')}\nTone: ${String(payload.tone ?? '')}`, json: false };
  if (task === 'daily_tasks') return { system: 'Create exactly three practical daily marketing tasks for a very small local business. Avoid repeated tasks when previous tasks are supplied. Return valid JSON only with this shape: {"tasks":[{"id":"string","date":"YYYY-MM-DD","kind":"review|content|improve","title":"string","description":"string","actionLabel":"string","why":"string","status":"open","source":"string"}]}.', user: `Business: ${profile}\nPrevious tasks: ${JSON.stringify(payload.previous ?? [])}`, json: true };
  return { system: 'Give one concise, practical recommendation that improves how a local business website answers a customer question. Use only supplied facts, do not claim that AI systems definitely rank or recommend the business. Return only the recommendation text.', user: `Business: ${profile}\nQuestion or issue: ${String(payload.question ?? '')}`, json: false };
}

function contentText(value: unknown): string { return typeof value === 'string' ? value : JSON.stringify(value); }

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  try {
    if (!rateLimit(context.request, 'ai', 30, 60_000)) return error('Too many AI requests from this network. Please try again in a minute.', 429);
    const body = await bodyJson(context.request);
    const task = typeof body.task === 'string' ? body.task : '';
    if (!['review_reply', 'social_post', 'daily_tasks', 'recommendation'].includes(task)) return error('Unsupported AI task.', 400);
    const payload = body.payload && typeof body.payload === 'object' ? body.payload as Record<string, unknown> : {};
    if (JSON.stringify(payload).length > 50_000) return error('The request is too large.', 413);
    const { system, user, json: wantsJson } = promptFor(task, payload);
    const env = context.env as Env;
    if (!env.AI_API_KEY || !env.AI_BASE_URL || !env.AI_MODEL) return error('AI provider is not configured. The app can still use its local assistant.', 503);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18_000);
    try {
      const response = await fetch(`${env.AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, { method: 'POST', signal: controller.signal, headers: { authorization: `Bearer ${env.AI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: env.AI_MODEL, temperature: .4, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], ...(wantsJson ? { response_format: { type: 'json_object' } } : {}) }) });
      if (!response.ok) return error('The AI provider returned an error.', 502);
      const data = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
      const raw = contentText(data.choices?.[0]?.message?.content ?? '').replace(/^```json\s*|```$/g, '').trim();
      if (wantsJson) return json(JSON.parse(raw));
      return json({ text: raw });
    } finally { clearTimeout(timer); }
  } catch (cause) { return error(cause instanceof Error ? cause.message : 'AI request failed.', 502); }
};
