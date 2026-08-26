import { error, json, type PagesContext } from '../../_lib';

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
  try {
    const slug = context.params.slug;
    if (!slug) return error('Report not found.', 404);
    if (!context.env.DB) return error('Report storage is not connected.', 404);
    const result = await context.env.DB.prepare('SELECT report_json FROM reports WHERE slug = ? LIMIT 1').bind(slug).first();
    if (!result?.report_json) return error('Report not found.', 404);
    return json(JSON.parse(result.report_json));
  } catch (cause) { return error(cause instanceof Error ? cause.message : 'Could not load report.', 404); }
};
