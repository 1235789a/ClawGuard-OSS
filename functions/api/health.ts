import { json, type PagesContext } from '../_lib';

export const onRequestGet = async (context: PagesContext): Promise<Response> => json({ ok: true, service: 'localbiz-copilot', aiConfigured: Boolean(context.env.AI_API_KEY && context.env.AI_BASE_URL && context.env.AI_MODEL), databaseConfigured: Boolean(context.env.DB) });
