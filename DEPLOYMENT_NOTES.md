# Milk Tomorrow — Deployment Notes

This document describes the current public demo and an optional production upgrade path. HackSocial-specific hosting, visibility, and judging-period checks are in [`HACKSOCIAL_2026_CHECKLIST.md`](HACKSOCIAL_2026_CHECKLIST.md).

## Current public demo

The credential-free Demo Mode is deployed on GitHub Pages:

- **Demo:** https://yo4e.github.io/Milk-Tomorrow/
- **Source:** https://github.com/yo4e/Milk-Tomorrow
- **Deployment workflow:** `.github/workflows/deploy-pages.yml` builds `app/` from `main`
- **Credentials and environment variables:** none required
- **Runtime services:** no database, server API, scheduled job, email provider, or external dataset

GitHub Pages fits the current artifact because the submitted slice is static and credential-free. The forecast engine is real TypeScript running in the browser. Demo coordination uses browser APIs and is deliberately limited to tabs on one browser and origin.

## Review-access contract

For any public submission:

1. Keep a credential-free route available even if a production adapter is added later.
2. Verify the URL in a signed-out browser with empty local storage.
3. Confirm the six-step README loop from reset through purchase and correction.
4. Check the target event's required repository/demo visibility and judging duration.
5. Do not make an unfinished backend, expiring credential, private invite, or paid service a dependency for basic review.
6. Recheck the host's current quotas, terms, and acceptable-use policy immediately before submission; do not rely on old plan descriptions in repository history.

## Static deployment flow

The GitHub Pages workflow installs dependencies, runs the protected runtime check, creates a Pages-specific Vite build, and publishes the result. The normal production build also emits the static files required by the repository's Sites packaging.

Verify locally with:

```bash
cd app
npm ci
npm test
npm run check:runtime
npm run build
npm run test:sites
```

The Pages workflow uses `npm run build:pages`, which applies the `/Milk-Tomorrow/` base path expected by the public repository URL.

## Production upgrade boundary

A genuinely cross-device household service needs server-authoritative state. A future implementation can add:

- a server-capable host for application routes or functions;
- Postgres or another transactional store for household state and atomic claims;
- realtime subscriptions or push events across devices;
- authentication and household membership;
- a scheduler for forecast evaluation;
- an email or push provider for signed notification actions.

These are roadmap adapters, not capabilities of the current public demo. Provider names such as Supabase, Vercel, or Resend are implementation options, not submission evidence until they are connected and testable.

## Keep the domain portable

```text
forecast engine       -> pure TypeScript, platform-independent
coordination rules    -> pure request state machine
browser demo state    -> localStorage + Web Locks + tab events
production state      -> future server-authoritative adapter
notifications         -> future provider adapter
web UI                -> current React client
```

Do not couple the forecast algorithm to a host, database, or notification vendor. The current domain tests should run without network access or credentials after any production adapter is added.

## Human-required steps for a future backend

Only a future production expansion—not the current review demo—would require the participant to:

1. Select accounts and providers whose current terms match the intended use.
2. Create projects, databases, domains, and notification credentials.
3. Store secrets in the deployment platform rather than the repository.
4. Configure authentication, authorization, retention, deletion, and recovery behavior.
5. Verify atomic claims and realtime updates between separate authenticated devices.
6. Confirm costs, quotas, domain/DNS settings, privacy disclosures, and operational ownership.

## No-credential fallback behavior

The public artifact must continue to demonstrate:

- a fictional household;
- forecasted milk depletion and a weekend effect;
- `I'll get it` and one winning same-browser claim;
- `We still have some` with bounded correction and snooze;
- purchase completion and forecast recalculation;
- reset, time travel, and model inspection.

## Priority order

1. Working public demo.
2. Correct forecast and coordination loop.
3. Stable mobile-friendly UX.
4. Reliable seeded reset and transparent limitations.
5. Target-event submission compliance.
6. Optional production adapters.

Do not trade a judgeable, reproducible artifact for infrastructure that the target event does not require.
