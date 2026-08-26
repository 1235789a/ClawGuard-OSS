# V1 test checklist

## Automated checks

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`

## Manual acceptance

- [ ] Open landing page on a narrow phone viewport.
- [ ] Click **Try the demo** and confirm `Demo data` is visible.
- [ ] Confirm Today shows exactly three tasks.
- [ ] Mark a task Done, Skip it, then Refresh today.
- [ ] Enter a real URL with remote API disabled and confirm the result is labelled `Local preview` and missing fields are not guessed.
- [ ] Edit Profile and confirm the fields persist after reload.
- [ ] Paste a review, generate a reply, copy it, and confirm no request for a better rating appears.
- [ ] Paste a public review URL, generate a QR, download the PNG.
- [ ] Generate one post for each platform and copy it.
- [ ] Open Growth and expand/collapse AI Visibility.
- [ ] Confirm real workspaces show `Not enough data` rather than invented Review/Content scores.
- [ ] Generate a report; without remote mode confirm the local-preview warning.
- [ ] With D1 and remote mode, open `/report/:slug` in a separate browser.
- [ ] Submit a report email only after checking consent.
- [ ] Confirm no AI key appears in built frontend assets.
- [ ] Check `/api/health` after deployment.
- [ ] Install the PWA from HTTPS and confirm standalone launch.
- [ ] Disconnect the network and confirm the offline page / cached shell behavior.
- [ ] Test keyboard focus, labels, button disabled states and color contrast.
