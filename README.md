# LocalBiz Copilot V1

`Your 3-minute daily marketing assistant for local businesses.`

LocalBiz Copilot is an anonymous-first mobile-first web app for independent local businesses. It turns one website URL into a small business profile, three practical daily actions, review reply help, social post drafts, a transparent growth snapshot, and an optional hand-off to MultiHub GEO.

## What is included

- Website analysis with a local preview fallback and a Cloudflare Pages server analyzer.
- Daily `Today` workspace with exactly three task cards, completion, skip, refresh and history.
- Review reply assistant with responsible wording rules.
- Review QR generator with PNG download; no incentives, gating or fake-review features.
- Content drafts for Instagram, Facebook and Google Business Profile.
- Explainable Growth score and website-based AI Visibility readiness checks.
- Free report generation, consent-based lead capture and public report API.
- PWA manifest, service worker, offline page and mobile-first responsive layout.
- Cloudflare Pages Functions, D1 migration and server-side OpenAI-compatible provider adapter.
- Minimal analytics events and a server-side in-memory rate limiter.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite. With the default `VITE_USE_REMOTE_API=false`, choose **Try the demo** for Joe's Coffee or enter a website for a transparent local preview. The local preview does not claim to have fetched or verified the website; it only knows the URL and asks for missing details in Profile.

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Real website analysis and AI

Build with `VITE_USE_REMOTE_API=true` to use the Pages Functions endpoints:

```env
VITE_USE_REMOTE_API=true
VITE_API_BASE_URL=
VITE_MULTIHUB_GEO_URL=https://your-multihub-service-page.example
```

The browser never receives `AI_API_KEY`. Configure the server variables in Cloudflare Pages runtime settings:

```text
AI_PROVIDER=openai-compatible
AI_API_KEY=<secret>
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=<model-name>
MULTIHUB_GEO_URL=https://your-multihub-service-page.example
```

Any OpenAI-compatible endpoint can be used by changing `AI_BASE_URL` and `AI_MODEL`. If no server AI provider is configured, the app returns a clear configuration error and the client can still use its local rule-based assistant.

## Cloudflare Pages deployment

1. Create a Pages project named `localbiz-copilot` and connect this repository.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Set the build-time `VITE_*` variables from `.env.example`.
4. Create a D1 database and replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml`.
5. Apply the migration:

   ```bash
   npx wrangler d1 migrations apply localbiz-copilot --remote
   ```

6. Add `DB` as the D1 binding in Pages Functions and add the server variables listed above. Store `AI_API_KEY` as a secret.
7. Deploy with the Pages Git integration or:

   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name localbiz-copilot
   ```

The independent product can then use its own `*.pages.dev` URL. Do not point it at the MultiHub domain. Complete deployment prerequisites are listed in `HUMAN_ACTIONS.md`.

## PWA and Android

The app includes a manifest, standalone display mode, icons, service-worker caching and an offline fallback. On mobile Chrome, open the deployed Pages URL and choose **Install app** or **Add to Home screen**. See `MOBILE.md` for the Android wrapper decision and commands.

## Routes and data

Client views are switched inside the SPA: Today, Reviews, Content, Growth, Profile and Report. Public reports use `/report/:slug` when D1 is configured. Anonymous browser state is stored locally until the user chooses an action that needs a server, such as website analysis, report saving or email capture.

The D1 schema is in `migrations/0001_init.sql`. It covers business profiles, users, tasks, content history, scores, reports, leads, consent and events.

## Honest limitations in V1

- Website analysis is intentionally limited to the homepage plus up to three same-origin useful pages. It does not claim to test ChatGPT, Gemini or Perplexity mentions.
- Reviews and Content scores are `Not enough data` for a fresh real workspace until local activity is recorded. Only Demo Mode uses the requested simulated scores.
- Public reports require D1. Without remote mode, a report is clearly labelled as a browser-local preview.
- The V1 lead endpoint records a consented email; transactional email delivery is intentionally not included until an email provider is chosen and configured.
- No automatic Meta/Google publishing, bulk messaging, scraping of reviews, billing, team accounts or account farming is included.
- Rate limiting is best-effort in-memory protection on the edge isolate; production traffic should add a Cloudflare WAF/rate-limit rule.
