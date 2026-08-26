# Mobile / Android plan

## V1: installable PWA

The shipped path is the PWA. It has:

- standalone display mode;
- portrait mobile layout and bottom navigation;
- `manifest.webmanifest` and app icon;
- service-worker shell caching;
- offline fallback that explains which actions need a connection.

Test it on a deployed HTTPS Pages URL. In Chrome for Android, use the browser menu and choose **Install app**. The installed app opens without the normal browser tab chrome.

## Optional Android wrapper

If a Play Store presence becomes important, use Trusted Web Activity first:

1. Deploy the PWA on its final HTTPS `pages.dev` or custom domain.
2. Verify the manifest, service worker, HTTPS and Digital Asset Links.
3. Generate a TWA wrapper with Bubblewrap or Android Studio.
4. Add `/.well-known/assetlinks.json` for the package and signing certificate.
5. Test offline, back navigation, external links, file download and install/update behavior.

Capacitor is a later option if native notifications, camera access or deeper device APIs are needed. It is deliberately not included in V1: a thin WebView wrapper would add release and policy overhead without improving the daily workflow.
