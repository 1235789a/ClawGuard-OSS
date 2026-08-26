export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'business';
}

export function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Please enter a valid website URL.');
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

export function initials(value: string): string {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}
