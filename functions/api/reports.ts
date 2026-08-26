import { bodyJson, error, json, type PagesContext } from '../_lib';

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  try {
    const body = await bodyJson(context.request);
    if (!body.slug || !body.profile || !body.scores) return error('A report needs a slug, profile and scores.', 400);
    const report = { ...body, isPublic: true };
    if (!context.env.DB) return json(report, 201);
    await context.env.DB.prepare('INSERT INTO reports (slug, business_name, report_json, created_at) VALUES (?, ?, ?, ?)').bind(String(body.slug), String((body.profile as Record<string, unknown>).businessName ?? ''), JSON.stringify(report), body.createdAt ?? new Date().toISOString()).run();
    return json(report, 201);
  } catch (cause) { return error(cause instanceof Error ? cause.message : 'Could not save report.', 400); }
};
