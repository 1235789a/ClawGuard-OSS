import type { AnalyticsEvent } from '../types';

const REMOTE_ENABLED = import.meta.env.VITE_USE_REMOTE_API === 'true';

export function createEvent(name: string, properties?: AnalyticsEvent['properties']): AnalyticsEvent {
  return { name, createdAt: new Date().toISOString(), properties };
}

export async function sendEvent(event: AnalyticsEvent): Promise<void> {
  if (!REMOTE_ENABLED) return;
  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Analytics must never block a user action.
  }
}
