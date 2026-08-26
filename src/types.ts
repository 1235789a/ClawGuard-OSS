export type Tone = 'friendly' | 'professional' | 'short';
export type ContentTone = 'Promotional' | 'Educational' | 'Casual' | 'Behind the scenes' | 'Product highlight' | 'Customer-focused';
export type TaskKind = 'review' | 'content' | 'improve';
export type ViewName = 'today' | 'reviews' | 'content' | 'growth' | 'profile' | 'report';

export interface BusinessProfile {
  id: string;
  websiteUrl: string;
  businessName: string;
  industry: string;
  description: string;
  location: string;
  productsServices: string[];
  brandTone: string;
  audience: string;
  socialLinks: string[];
  contactLinks: string[];
  detectedFaq: string[];
  openingHours?: string;
  lastAnalyzedAt: string;
  analysisMode: 'demo' | 'verified' | 'local-preview' | 'manual';
  checks?: WebsiteChecks;
}

export interface WebsiteChecks {
  businessNameClarity: boolean | null;
  locationClarity: boolean | null;
  aboutInformation: boolean | null;
  serviceClarity: boolean | null;
  faqPresence: boolean | null;
  structuredContent: boolean | null;
  contactClarity: boolean | null;
  entityConsistency: boolean | null;
  schemaPresence: boolean | null;
  robotsTxt: boolean | null;
  sitemap: boolean | null;
  llmsTxt: boolean | null;
  importantPages: boolean | null;
}

export interface Scores {
  overall: number | null;
  website: number | null;
  reviews: number | null;
  content: number | null;
  aiVisibility: number | null;
}

export interface Task {
  id: string;
  date: string;
  kind: TaskKind;
  title: string;
  description: string;
  actionLabel: string;
  why: string;
  status: 'open' | 'done' | 'skipped';
  source: string;
}

export interface ContentSet {
  platform: 'Instagram' | 'Facebook' | 'Google Business Profile';
  tone: ContentTone;
  text: string;
  generatedAt: string;
}

export interface Report {
  id: string;
  slug: string;
  createdAt: string;
  profile: BusinessProfile;
  scores: Scores;
  topIssues: string[];
  nextActions: string[];
  isPublic: boolean;
}

export interface AnalyticsEvent {
  name: string;
  createdAt: string;
  properties?: Record<string, string | number | boolean | null>;
}

export interface AppState {
  profile: BusinessProfile | null;
  scores: Scores;
  tasks: Task[];
  taskHistory: Task[];
  content: ContentSet | null;
  report: Report | null;
  events: AnalyticsEvent[];
  isDemo: boolean;
  leadEmail: string;
  consent: boolean;
}

export interface AnalysisResult {
  profile: BusinessProfile;
  scores: Scores;
}
