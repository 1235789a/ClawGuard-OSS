# MultiHub Site Check

Free website checks for independent businesses. Visitors enter a domain and receive technical,
security, trust, infrastructure and discoverability findings without creating an account.

The public experience is branded for MultiHub GEO and includes a low-pressure discovery review,
WhatsApp and Facebook community funnel after the useful report.

## Run locally

Requirements: Node.js 22.12+ and Yarn 1.22.

```bash
yarn install
yarn dev
```

## Brand and contact configuration

Copy `.env.sample` to `.env` and set:

```dotenv
PUBLIC_MULTIHUB_URL=https://multhub.top
PUBLIC_WHATSAPP_URL=https://wa.me/COUNTRY_CODE_AND_NUMBER
PUBLIC_FACEBOOK_GROUP_URL=https://www.facebook.com/groups/YOUR_GROUP
SITE_URL=https://your-public-tool-domain.example
```

Empty contact values are hidden or fall back to the MultiHub website, so no fake details are published.

## Deployment

The upstream project supports Vercel, Netlify and Docker. Vercel is the shortest path because its
serverless API routes are already configured in `vercel.json`.

## Responsible use

Only scan websites you own or are authorized to assess. Results are informational and are not a
legal, compliance or security guarantee.

## License and attribution

Based on [Lissy93/Web-Check](https://github.com/Lissy93/web-check), created by Alicia Sykes and
distributed under the MIT License. The original notice is retained in [LICENSE](LICENSE).
