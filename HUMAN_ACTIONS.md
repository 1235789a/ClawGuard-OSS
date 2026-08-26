# Human actions

The local app, Demo Mode and client-side fallback do not need any account, API key or domain configuration. The following actions are needed only for a real public deployment.

ACTION: Create a Cloudflare Pages project named `localbiz-copilot`.
WHY: This provides the independent `*.pages.dev` product host.
WHERE: Cloudflare Dashboard → Workers & Pages → Create application.
WHAT I NEED TO DO: Connect the repository, set build command `npm run build`, output directory `dist`, and deploy.
BLOCKING: YES

ACTION: Create a Cloudflare D1 database and replace the placeholder `database_id` in `wrangler.toml`.
WHY: D1 is required for public reports, leads, events and durable product data.
WHERE: Cloudflare Dashboard → Storage & Databases → D1, then `wrangler.toml`.
WHAT I NEED TO DO: Create the `localbiz-copilot` database, paste its ID, and run `npx wrangler d1 migrations apply localbiz-copilot --remote`.
BLOCKING: YES

ACTION: Add the D1 binding named `DB` to the Pages project.
WHY: Pages Functions need the binding to read and write reports, leads and analytics.
WHERE: Cloudflare Pages project → Settings → Functions → D1 bindings.
WHAT I NEED TO DO: Bind `DB` to the `localbiz-copilot` database for the production environment.
BLOCKING: YES

ACTION: Choose an OpenAI-compatible AI provider and set server runtime variables.
WHY: Remote AI generation and daily task generation need a provider; the client fallback works without it.
WHERE: Cloudflare Pages project → Settings → Environment variables; store the key as a secret.
WHAT I NEED TO DO: Set `AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`, and secret `AI_API_KEY`.
BLOCKING: NO

ACTION: Set build-time frontend variables.
WHY: The deployed browser needs to know to call Pages Functions and where the optional service CTA goes.
WHERE: Cloudflare Pages project → Settings → Builds & deployments → Environment variables.
WHAT I NEED TO DO: Set `VITE_USE_REMOTE_API=true`, optional `VITE_API_BASE_URL`, and `VITE_MULTIHUB_GEO_URL` to the real MultiHub GEO sales page, then trigger a new build.
BLOCKING: YES

ACTION: Set the server-side `MULTIHUB_GEO_URL` variable to the same approved service page.
WHY: Keeps the service destination explicit and configurable at the edge.
WHERE: Cloudflare Pages runtime environment variables.
WHAT I NEED TO DO: Paste the approved MultiHub GEO URL; do not hardcode it in source.
BLOCKING: NO

ACTION: Configure a Cloudflare WAF/rate-limit rule for `/api/analyze` and `/api/ai`.
WHY: The included isolate-local limiter is best-effort and is not a durable abuse-control system.
WHERE: Cloudflare Dashboard → Security → WAF → Rate limiting rules.
WHAT I NEED TO DO: Add conservative per-IP limits and review them after observing real traffic.
BLOCKING: NO

ACTION: Verify the final product URL, legal copy and privacy/contact details before public promotion.
WHY: The app collects optional email consent and analyzes public websites; public-facing ownership and privacy information should be accurate.
WHERE: Deployed app and its public footer/report pages.
WHAT I NEED TO DO: Confirm ownership, privacy notice, support contact and any applicable local requirements.
BLOCKING: YES

ACTION: If actual transactional report emails are required, choose an email provider and add a delivery adapter.
WHY: V1 records a consented lead safely but does not pretend to send an email without a configured delivery service.
WHERE: A future Pages Function adapter and the provider’s server-side environment variables.
WHAT I NEED TO DO: Choose the provider, add its secret, implement delivery, and update the report copy after testing unsubscribe handling.
BLOCKING: NO

ACTION: If publishing an Android app, create the package, signing key and Digital Asset Links file.
WHY: TWA requires a verified relationship between the Android package and the HTTPS PWA origin.
WHERE: Android Studio/Bubblewrap and the deployed `/.well-known/assetlinks.json` path.
WHAT I NEED TO DO: Follow `MOBILE.md`, test the PWA first, then complete Play Console setup if needed.
BLOCKING: NO
