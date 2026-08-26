import { computeScores } from './scoring';
import { normalizeWebsiteUrl } from './utils';
import type { AnalysisResult, BusinessProfile } from '../types';

const REMOTE_ENABLED = import.meta.env.VITE_USE_REMOTE_API === 'true';

function titleFromHost(hostname: string): string {
  const first = hostname.replace(/^www\./, '').split('.')[0] || 'Your Business';
  return first.split(/[-_]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function localPreview(url: string): AnalysisResult {
  const parsed = new URL(url);
  const businessName = titleFromHost(parsed.hostname);
  const profile: BusinessProfile = {
    id: `local-${Date.now()}`,
    websiteUrl: url,
    businessName,
    industry: 'Local business',
    description: '',
    location: '',
    productsServices: [],
    brandTone: 'Not enough data',
    audience: 'Not enough data',
    socialLinks: [],
    contactLinks: [],
    detectedFaq: [],
    lastAnalyzedAt: new Date().toISOString(),
    analysisMode: 'local-preview',
    checks: {
      businessNameClarity: null, locationClarity: null, aboutInformation: null, serviceClarity: null,
      faqPresence: null, structuredContent: null, contactClarity: null, entityConsistency: null,
      schemaPresence: null, robotsTxt: null, sitemap: null, llmsTxt: null, importantPages: null,
    },
  };
  return { profile, scores: computeScores(profile) };
}

export async function analyzeWebsite(rawUrl: string): Promise<AnalysisResult> {
  const url = normalizeWebsiteUrl(rawUrl);
  if (!REMOTE_ENABLED) return localPreview(url);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/analyze`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error('The website could not be analyzed right now.');
    return await response.json() as AnalysisResult;
  } catch (error) {
    if (error instanceof TypeError) return localPreview(url);
    throw error;
  }
}
