import { bodyJson, error, json, rateLimit, type PagesContext } from '../_lib';

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  try {
    if (!rateLimit(context.request, 'lead', 5, 60_000)) return error('Too many requests. Please try again later.', 429);
    const body = await bodyJson(context.request);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error('Please provide a valid email address.', 400);
    if (body.consent !== true) return error('Consent is required before saving a report.', 400);
    if (context.env.DB) await context.env.DB.prepare('INSERT INTO leads (email, consent, source, created_at) VALUES (?, 1, ?, ?)').bind(email, body.source ?? 'report', new Date().toISOString()).run();
    return json({ ok: true }, 201);
  } catch (cause) { return error(cause instanceof Error ? cause.message : 'Could not save lead.', 400); }
};
