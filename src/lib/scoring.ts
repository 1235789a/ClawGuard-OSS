import type { BusinessProfile, Scores, WebsiteChecks } from '../types';
import { clamp } from './utils';

const checkValues = (checks?: WebsiteChecks): boolean[] => checks ? Object.values(checks).filter((value): value is boolean => typeof value === 'boolean') : [];

export function scoreWebsite(profile: BusinessProfile): number | null {
  if (profile.analysisMode === 'demo') return 74;
  const signals = [profile.businessName, profile.description, profile.location, profile.productsServices.length, profile.contactLinks.length, profile.socialLinks.length];
  const known = signals.filter((value) => Boolean(value)).length;
  return known ? clamp(35 + known * 10) : null;
}

export function scoreAiVisibility(profile: BusinessProfile): number | null {
  const values = checkValues(profile.checks);
  if (!values.length) return null;
  return clamp((values.filter(Boolean).length / values.length) * 100);
}

export function computeScores(profile: BusinessProfile, existing?: Partial<Scores>): Scores {
  const website = scoreWebsite(profile);
  const aiVisibility = scoreAiVisibility(profile);
  const available = [website, existing?.reviews ?? null, existing?.content ?? null, aiVisibility].filter((value): value is number => typeof value === 'number');
  return {
    website,
    reviews: existing?.reviews ?? (profile.analysisMode === 'demo' ? 65 : null),
    content: existing?.content ?? (profile.analysisMode === 'demo' ? 72 : null),
    aiVisibility,
    overall: available.length ? clamp(available.reduce((sum, value) => sum + value, 0) / available.length) : null,
  };
}

export function topIssues(profile: BusinessProfile, scores: Scores): string[] {
  const issues: string[] = [];
  if (!profile.description) issues.push('Your business description is missing or too short.');
  if (!profile.location) issues.push('Your location is not clearly stated.');
  if (!profile.productsServices.length) issues.push('Your main products or services are hard to identify.');
  if (!profile.detectedFaq.length) issues.push('Important customer questions are missing from the website.');
  if (profile.checks && profile.checks.entityConsistency === false) issues.push('Business details are not fully consistent across the site.');
  if (typeof scores.aiVisibility === 'number' && scores.aiVisibility < 60) issues.push('The website gives AI assistants limited context about the business.');
  return issues.slice(0, 3);
}

export function nextActions(profile: BusinessProfile, scores: Scores): string[] {
  const actions: string[] = [];
  if (!profile.location) actions.push('Add your city and neighborhood to the About or Contact page.');
  if (!profile.detectedFaq.length) actions.push('Add three short answers to common customer questions.');
  if (!profile.productsServices.length) actions.push('List your most important products or services in plain language.');
  if (typeof scores.reviews !== 'number') actions.push('Invite recent customers to leave an honest review.');
  if (typeof scores.content !== 'number') actions.push('Post one real update from your business today.');
  if (!actions.length) actions.push('Keep your business details consistent and publish one useful local update this week.');
  return actions.slice(0, 3);
}
