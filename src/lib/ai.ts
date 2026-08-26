import type { BusinessProfile, ContentSet, ContentTone, Task, Tone } from '../types';

const REMOTE_ENABLED = import.meta.env.VITE_USE_REMOTE_API === 'true';

export interface AIProvider {
  generateReviewReply(review: string, tone: Tone, profile: BusinessProfile): Promise<string>;
  generateSocialPost(platform: ContentSet['platform'], tone: ContentTone, profile: BusinessProfile): Promise<string>;
  generateDailyTasks(profile: BusinessProfile, previous: Task[]): Promise<Task[]>;
  generateRecommendation(question: string, profile: BusinessProfile): Promise<string>;
}

class LocalAIProvider implements AIProvider {
  async generateReviewReply(review: string, tone: Tone, profile: BusinessProfile): Promise<string> {
    const clean = review.trim().replace(/\s+/g, ' ');
    const opening = tone === 'professional' ? 'Thank you for sharing your feedback.' : tone === 'short' ? 'Thanks for visiting us.' : 'Thanks so much for visiting us and sharing this feedback.';
    const response = /wait|slow|late|delay/i.test(clean)
      ? `We’re sorry the wait was longer than it should have been. We’re reviewing what happened so we can make the next visit smoother. ${opening} — ${profile.businessName}`
      : `${opening} We’re glad you stopped by, and we hope to welcome you back soon. — ${profile.businessName}`;
    return response;
  }

  async generateSocialPost(platform: ContentSet['platform'], tone: ContentTone, profile: BusinessProfile): Promise<string> {
    const place = profile.location ? `in ${profile.location}` : 'in the neighborhood';
    const hooks: Record<ContentTone, string> = {
      Promotional: `A little reason to stop by ${profile.businessName} today: ${profile.productsServices[0] ?? 'something good'} and a friendly welcome ${place}.`,
      Educational: `Quick tip from ${profile.businessName}: ask us what is freshest today—we’re happy to help you choose.`,
      Casual: `What is your usual order? We’re serving the regulars, the curious and everyone in between at ${profile.businessName}.`,
      'Behind the scenes': `A small behind-the-scenes moment from ${profile.businessName}: getting ready for today’s customers ${place}.`,
      'Product highlight': `Today’s highlight at ${profile.businessName}: ${profile.productsServices[0] ?? 'our favorite local pick'}. Simple, fresh and ready when you are.`,
      'Customer-focused': `Planning a visit? ${profile.businessName} is here to make your next ${profile.industry.toLowerCase()} stop easy and enjoyable ${place}.`,
    };
    const suffix = platform === 'Instagram' ? ' What are you in the mood for? ☕' : platform === 'Google Business Profile' ? ' Visit us today or send us a message with your question.' : ' Tell us what you would like to see next.';
    return `${hooks[tone]}${suffix}`;
  }

  async generateDailyTasks(profile: BusinessProfile, previous: Task[]): Promise<Task[]> {
    const date = new Date().toISOString().slice(0, 10);
    const seed = previous.length + date.length;
    const tasks: Task[] = [
      { id: `${date}-review-${seed}`, date, kind: 'review', title: 'Reply to a customer review', description: 'Paste one recent review and send a thoughtful reply.', actionLabel: 'Write a reply', why: 'A genuine response shows that your business is active and listening.', status: 'open', source: 'reviews' },
      { id: `${date}-content-${seed}`, date, kind: 'content', title: 'Share one real update', description: `Post a short update from ${profile.businessName}.`, actionLabel: 'Create a post', why: 'Small, specific updates keep your business present when locals are deciding what to do.', status: 'open', source: 'content' },
      { id: `${date}-improve-${seed}`, date, kind: 'improve', title: 'Make one answer easier to find', description: profile.detectedFaq.length ? `Check whether “${profile.detectedFaq[0]}” is answered clearly.` : 'Add one answer to a question customers ask before visiting.', actionLabel: 'Generate answer', why: 'Clear answers help customers and AI assistants understand your business.', status: 'open', source: 'website' },
    ];
    return tasks;
  }

  async generateRecommendation(question: string, profile: BusinessProfile): Promise<string> {
    return `Add a short, direct answer to “${question}” on your FAQ or service page. Use plain language, mention ${profile.location || 'your area'} when relevant, and keep the answer specific to ${profile.businessName}.`;
  }
}

class RemoteAIProvider implements AIProvider {
  private async call<T>(task: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/ai`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ task, payload }),
    });
    if (!response.ok) throw new Error('AI is temporarily unavailable.');
    return await response.json() as T;
  }

  generateReviewReply(review: string, tone: Tone, profile: BusinessProfile) { return this.call<{ text: string }>('review_reply', { review, tone, profile }).then((result) => result.text); }
  generateSocialPost(platform: ContentSet['platform'], tone: ContentTone, profile: BusinessProfile) { return this.call<{ text: string }>('social_post', { platform, tone, profile }).then((result) => result.text); }
  generateDailyTasks(profile: BusinessProfile, previous: Task[]) { return this.call<{ tasks: Task[] }>('daily_tasks', { profile, previous }).then((result) => result.tasks); }
  generateRecommendation(question: string, profile: BusinessProfile) { return this.call<{ text: string }>('recommendation', { question, profile }).then((result) => result.text); }
}

export const aiProvider: AIProvider = REMOTE_ENABLED ? new RemoteAIProvider() : new LocalAIProvider();
