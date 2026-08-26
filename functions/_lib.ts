export type Env = {
  DB?: any;
  AI_PROVIDER?: string;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
  MULTIHUB_GEO_URL?: string;
};

export type PagesContext = { request: Request; env: Env; params: Record<string, string | undefined> };

export const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

const rateBuckets = new Map<string, { startedAt: number; count: number }>();
export function rateLimit(request: Request, bucket: string, limit = 20, windowMs = 60_000): boolean {
  const forwarded = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anonymous';
  const key = `${bucket}:${forwarded.split(',')[0].trim()}`;
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt >= windowMs) { rateBuckets.set(key, { startedAt: now, count: 1 }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function error(message: string, status = 400): Response { return json({ error: message }, status); }

export async function bodyJson(request: Request): Promise<Record<string, unknown>> {
  try { const body = await request.json(); return body && typeof body === 'object' ? body as Record<string, unknown> : {}; } catch { throw new Error('Invalid JSON body.'); }
}

export function normalizeUrl(input: unknown): URL {
  if (typeof input !== 'string' || input.trim().length < 4 || input.length > 2_000) throw new Error('Please enter a valid website URL.');
  const value = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http and https websites are supported.');
  if (url.username || url.password) throw new Error('Website credentials are not accepted.');
  assertPublicHostname(url.hostname);
  url.hash = '';
  return url;
}

export function assertPublicHostname(hostname: string): void {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const blocked = ['localhost', 'localhost.localdomain', 'metadata.google.internal', 'instance-data.ec2.internal'];
  if (blocked.includes(host) || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) throw new Error('Private and local network addresses are not allowed.');
  if (host === '::1' || host === '0.0.0.0' || host === '::' || host === '169.254.169.254') throw new Error('Private and local network addresses are not allowed.');
  const parts = host.split('.').map(Number);
  if (parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) throw new Error('Private and local network addresses are not allowed.');
  }
}

async function readLimited(response: Response, limit = 1_500_000): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error('The website page is too large to analyze.'); }
    chunks.push(part.value);
  }
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(merged);
}

export async function fetchPublicPage(url: URL, timeoutMs = 7_000): Promise<{ url: URL; html: string }> {
  assertPublicHostname(url.hostname);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let current = new URL(url.toString());
    let response = await fetch(current.toString(), { signal: controller.signal, redirect: 'manual', headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'LocalBizCopilot/1.0 (+website-analysis)' } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('The website returned an incomplete redirect.');
      const redirected = new URL(location, current);
      if (redirected.origin !== current.origin) throw new Error('Cross-site redirects are not followed for safety.');
      assertPublicHostname(redirected.hostname);
      current = redirected;
      response = await fetch(current.toString(), { signal: controller.signal, redirect: 'manual', headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'LocalBizCopilot/1.0 (+website-analysis)' } });
    }
    if (!response.ok) throw new Error(`The website returned HTTP ${response.status}.`);
    const type = response.headers.get('content-type') ?? '';
    const resourcePath = current.pathname.toLowerCase();
    const machineReadableResource = /\.(?:txt|xml)$/.test(resourcePath);
    if (type && !machineReadableResource && !type.includes('text/html') && !type.includes('application/xhtml')) throw new Error('That URL does not appear to be a web page.');
    return { url: current, html: await readLimited(response) };
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw new Error('The website took too long to respond.');
    throw cause;
  } finally { clearTimeout(timer); }
}

export function decode(value: string): string {
  return value.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}

export function stripHtml(html: string): string {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 30_000);
}

export function meta(html: string, name: string): string {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const reverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
  return decode(html.match(pattern)?.[1] ?? html.match(reverse)?.[1] ?? '').trim();
}

export function title(html: string): string { return decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? ''); }

export function links(html: string): string[] {
  return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((match) => decode(match[1])).filter(Boolean).slice(0, 100);
}

export function absoluteLinks(raw: string[], base: URL): string[] { return raw.map((value) => { try { return new URL(value, base).toString(); } catch { return ''; } }).filter(Boolean); }

export function slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'business'; }

export function scoreFromChecks(checks: Record<string, boolean | null>): number | null {
  const values = Object.values(checks).filter((value): value is boolean => typeof value === 'boolean');
  return values.length ? Math.round(values.filter(Boolean).length / values.length * 100) : null;
}
