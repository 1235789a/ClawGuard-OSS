import type { BusinessProfile, Scores, Task } from '../types';

export const demoProfile: BusinessProfile = {
  id: 'demo-joes-coffee',
  websiteUrl: 'https://joescoffee.example',
  businessName: "Joe's Coffee",
  industry: 'Independent Coffee Shop',
  description: 'A neighborhood coffee shop serving espresso, pastries and relaxed mornings in Amsterdam.',
  location: 'Amsterdam',
  productsServices: ['Espresso drinks', 'Fresh pastries', 'Coffee beans'],
  brandTone: 'Warm and neighborhood-friendly',
  audience: 'Local coffee drinkers, remote workers and weekend visitors',
  socialLinks: ['https://instagram.com/joescoffee'],
  contactLinks: ['mailto:hello@joescoffee.example'],
  detectedFaq: ['Do you offer vegan options?', 'Do you have Wi-Fi?', 'Where can I find you?'],
  openingHours: 'Mon–Sun · 8:00–18:00',
  lastAnalyzedAt: '2026-08-26T05:00:00.000Z',
  analysisMode: 'demo',
  checks: {
    businessNameClarity: true,
    locationClarity: true,
    aboutInformation: true,
    serviceClarity: true,
    faqPresence: true,
    structuredContent: true,
    contactClarity: true,
    entityConsistency: false,
    schemaPresence: true,
    robotsTxt: true,
    sitemap: true,
    llmsTxt: false,
    importantPages: true,
  },
};

export const demoScores: Scores = { overall: 68, website: 74, reviews: 65, content: 72, aiVisibility: 31 };

export const demoTasks: Task[] = [
  {
    id: 'demo-review', date: '2026-08-26', kind: 'review', title: 'Reply to a customer review',
    description: 'A thoughtful reply shows new customers that you are listening.', actionLabel: 'Write a reply',
    why: 'Recent, human replies make your business feel active and trustworthy.', status: 'open', source: 'reviews',
  },
  {
    id: 'demo-content', date: '2026-08-26', kind: 'content', title: 'Share something from the counter',
    description: 'Post one small behind-the-scenes moment from Joe’s Coffee today.', actionLabel: 'Create a post',
    why: 'Simple, specific updates are easier for local customers to remember.', status: 'open', source: 'content',
  },
  {
    id: 'demo-improve', date: '2026-08-26', kind: 'improve', title: 'Answer a question customers may have',
    description: 'Add a clear answer to “Do you offer vegan options?” on your website.', actionLabel: 'Generate answer',
    why: 'Useful answers help people decide before they leave home—and help assistants understand you.', status: 'open', source: 'website',
  },
];
