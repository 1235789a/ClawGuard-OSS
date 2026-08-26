# Product architecture

## Runtime shape

```text
Browser / installed PWA
        |
        |  localStorage-first state, fetch only when needed
        v
React + TypeScript SPA (Vite)
        |
        |  /api/analyze   /api/ai   /api/events   /api/leads   /api/reports
        v
Cloudflare Pages Functions
        |
        +--> Website fetcher with URL validation, robots check, same-origin page cap,
        |    1.5 MB response cap and abort timeout
        +--> OpenAI-compatible AI provider (server secret only)
        +--> D1 for reports, leads, events and future durable workspace state
```

## Frontend modules

- `src/types.ts`: shared product contracts.
- `src/lib/analyzer.ts`: local preview / remote analyzer selection.
- `src/lib/ai.ts`: `AIProvider` abstraction with local and remote implementations.
- `src/lib/scoring.ts`: directional, explainable score calculations and issue/action extraction.
- `src/lib/storage.ts`: anonymous browser persistence.
- `src/lib/analytics.ts`: non-blocking event forwarding.
- `src/pages/`: one focused surface per V1 capability.
- `src/components/`: layout, navigation, score rings, task cards, modal and icons.

## Business flow

```text
Website URL
  -> Business Profile
  -> Today: three actions
  -> Reviews / Content activity
  -> Growth score + website AI readiness
  -> Free report / share loop
  -> Optional, explicit MultiHub GEO CTA
```

The product brand and the service brand are separated. MultiHub GEO appears only after the user reaches AI Visibility issues and chooses the implementation-help button.

## Security and privacy decisions

- Only `http`/`https` URLs are accepted.
- Localhost, loopback, private IPv4 ranges, metadata hosts, local/internal domains, credentials in URLs and unsafe cross-origin redirects are rejected.
- HTML fetches are time-limited and capped; only same-origin candidate pages are considered.
- `robots.txt` is checked before analysis and a wildcard `Disallow: /` blocks the analysis.
- AI keys are read only by Pages Functions runtime variables.
- Lead collection requires an explicit checkbox and is never used for unsolicited messaging.
- Scores expose missing data as `Not enough data`, and external AI mention tests are not simulated.
- Event payloads are intentionally small and must not contain review text or secrets.

## Extensibility points

- Add a provider in `src/lib/ai.ts` without changing page components.
- Add a durable auth/user layer around the current anonymous state without changing task/content contracts.
- Add real AI mention tests behind a separate verified endpoint; do not reuse the current website readiness score.
- Add Cloudflare WAF rules and a durable rate-limit store before significant public traffic.
