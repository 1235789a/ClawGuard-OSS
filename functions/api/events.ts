import { bodyJson, error, json, type PagesContext } from '../_lib';

const allowed = new Set(['landing_view', 'website_submitted', 'business_detected', 'business_detection_failed', 'daily_task_view', 'daily_task_completed', 'daily_task_skipped', 'review_reply_generated', 'review_qr_created', 'content_generated', 'content_copied', 'growth_view', 'ai_visibility_view', 'report_generated', 'report_shared', 'lead_email_submitted', 'geo_cta_view', 'geo_cta_clicked', 'reviews_view', 'content_view']);

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  try {
    const body = await bodyJson(context.request);
    if (typeof body.name !== 'string' || !allowed.has(body.name)) return error('Unknown analytics event.', 400);
    if (context.env.DB) await context.env.DB.prepare('INSERT INTO events (name, properties_json, created_at) VALUES (?, ?, ?)').bind(body.name, JSON.stringify(body.properties ?? {}), body.createdAt ?? new Date().toISOString()).run();
    return json({ ok: true }, 202);
  } catch (cause) { return error(cause instanceof Error ? cause.message : 'Could not record event.', 400); }
};
