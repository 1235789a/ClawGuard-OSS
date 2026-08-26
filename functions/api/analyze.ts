import { absoluteLinks, bodyJson, decode, error, fetchPublicPage, json, links, meta, normalizeUrl, rateLimit, scoreFromChecks, stripHtml, title, type PagesContext } from '../_lib';

const pageHints = /about|contact|service|product|menu|faq|hours|location/i;

function findBusinessName(pageTitle: string, html: string): string {
  const og = meta(html, 'og:site_name') || meta(html, 'og:title');
  const heading = decodeHeading(html);
  return (og || heading || pageTitle).replace(/\s*[|–—-]\s*(home|welcome).*$/i, '').trim().slice(0, 100);
}

function decodeHeading(html: string): string { return html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? ''; }
function extractLocation(text: string): string { return text.match(/(?:located|based|serving|visit us|find us)[^.!?]{0,55}\b(?:in|at)\s+([A-Z][A-Za-z .'-]{2,45})/i)?.[1]?.trim() ?? ''; }
function extractFaq(text: string): string[] { return [...text.matchAll(/(?:^|\s)([^.?]{12,100}\?)\s*(?:answer|yes|no|we|our|you)/gi)].map((match) => match[1].trim()).slice(0, 6); }
function extractOfferings(html: string): string[] { return [...html.matchAll(/<(?:h2|h3|li)[^>]*>([\s\S]*?)<\/(?:h2|h3|li)>/gi)].map((match) => match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((value) => value.length > 2 && value.length < 80).slice(0, 8); }

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  try {
    if (!rateLimit(context.request, 'analyze', 8, 60_000)) return error('Too many analyses from this network. Please try again in a minute.', 429);
    const body = await bodyJson(context.request);
    const requested = normalizeUrl(body.url);
    const robotsPage = await fetchPublicPage(new URL('/robots.txt', requested), 2_500).catch(() => null);
    const wildcardRules = robotsPage?.html.match(/user-agent\s*:\s*\*([\s\S]*?)(?=\n\s*user-agent\s*:|$)/i)?.[1] ?? '';
    if (/disallow\s*:\s*\/\s*(?:\r?\n|$)/i.test(wildcardRules)) throw new Error('This website does not allow automated analysis in its robots.txt.');
    const home = await fetchPublicPage(requested);
    const homeText = stripHtml(home.html);
    const candidates = absoluteLinks(links(home.html), home.url).filter((href) => new URL(href).origin === home.url.origin && pageHints.test(new URL(href).pathname)).slice(0, 3);
    const extraPages: Array<{ url: URL; html: string }> = [];
    for (const candidate of candidates) {
      try { extraPages.push(await fetchPublicPage(new URL(candidate), 4_000)); } catch { /* one page can fail without failing the analysis */ }
    }
    const allHtml = [home.html, ...extraPages.map((page) => page.html)].join('\n');
    const allText = stripHtml(allHtml);
    const businessName = findBusinessName(title(home.html), home.html);
    const description = meta(home.html, 'description');
    const contactLinks = absoluteLinks(links(allHtml), home.url).filter((href) => /^(mailto:|tel:)/i.test(href));
    const socialLinks = absoluteLinks(links(allHtml), home.url).filter((href) => /instagram|facebook|tiktok|linkedin|youtube|twitter|x\.com/i.test(href)).slice(0, 8);
    const productsServices = extractOfferings(allHtml).filter((value) => !/^home|about|contact|faq|menu$/i.test(value)).slice(0, 5);
    const location = extractLocation(allText);
    const faq = extractFaq(allText);
    const robots = Boolean(robotsPage) || await fetchPublicPage(new URL('/robots.txt', home.url), 2_500).then(() => true).catch(() => false);
    const sitemap = await fetchPublicPage(new URL('/sitemap.xml', home.url), 2_500).then(() => true).catch(() => false);
    const llms = await fetchPublicPage(new URL('/llms.txt', home.url), 2_500).then(() => true).catch(() => false);
    const checks = {
      businessNameClarity: Boolean(businessName), locationClarity: Boolean(location), aboutInformation: /about|story|our mission/i.test(allText), serviceClarity: productsServices.length > 0,
      faqPresence: faq.length > 0, structuredContent: /<article|<section|<main/i.test(allHtml), contactClarity: contactLinks.length > 0 || /contact|reach us|get in touch/i.test(allText), entityConsistency: Boolean(businessName && allText.toLowerCase().includes(businessName.toLowerCase())),
      schemaPresence: /application\/ld\+json/i.test(allHtml), robotsTxt: robots, sitemap, llmsTxt: llms, importantPages: extraPages.length > 0,
    };
    const website = Math.round(([Boolean(businessName), Boolean(description), Boolean(location), productsServices.length > 0, checks.contactClarity, socialLinks.length > 0].filter(Boolean).length / 6) * 100);
    const aiVisibility = scoreFromChecks(checks);
    const profile = { id: `web-${Date.now()}`, websiteUrl: home.url.toString().replace(/\/$/, ''), businessName: businessName || home.url.hostname, industry: 'Local business', description, location, productsServices, brandTone: 'Not enough data', audience: 'Not enough data', socialLinks, contactLinks, detectedFaq: faq, lastAnalyzedAt: new Date().toISOString(), analysisMode: 'verified' as const, checks };
    const available = [website, aiVisibility].filter((value): value is number => typeof value === 'number');
    return json({ profile, scores: { overall: available.length ? Math.round(available.reduce((a, b) => a + b, 0) / available.length) : null, website, reviews: null, content: null, aiVisibility } });
  } catch (cause) { return error(cause instanceof Error ? cause.message : 'The website could not be analyzed.', 422); }
};
