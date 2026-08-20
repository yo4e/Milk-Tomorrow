# Milk Tomorrow — Deployment Notes

Codex should read this together with `DESIGN.md` and `IMPLEMENTATION_NOTES.md`.

## Deployment choice for the hackathon

For the Proof of Possible 2026 build, prefer:

- **Vercel Hobby** for the public web app and server-side routes/functions
- **Supabase** for Postgres, shared household state, realtime, and auth/data services as needed
- **Resend or equivalent** for email notifications

This is preferred over GitHub Pages for the hackathon because Milk Tomorrow needs more than static hosting: server-side request handling, signed action-link validation, atomic claim mutations, scheduled/background logic, and secrets that must not be exposed in client-side code.

GitHub Pages is still a viable future option if the architecture is intentionally split so that all backend behavior lives in Supabase Edge Functions or another backend service. Do not choose that architecture merely to avoid Vercel during this short hackathon unless it clearly reduces implementation risk.

## Vercel Hobby cost / traffic policy

The hackathon prototype should remain on the free **Hobby** plan unless there is a concrete reason to upgrade.

Design assumption for this prototype:

- do **not** enable paid overage / Pro billing merely for the hackathon;
- if free-plan resource limits are reached, treat service restriction or temporary unavailability as the risk to manage, rather than designing around hypothetical large traffic bills;
- keep the application lightweight so that normal Devpost judging traffic remains comfortably within free-tier usage;
- check the current Vercel limits and terms immediately before public submission because platform quotas and plan terms may change.

The larger practical risk for a hackathon is therefore **the demo becoming unavailable after a quota is exhausted**, not unexpectedly scaling infrastructure on purpose.

## Commercial-use boundary

Vercel Hobby is intended for personal/non-commercial use under Vercel's current plan terms. Milk Tomorrow is being deployed here as a hackathon / prototype project.

If Milk Tomorrow later becomes a commercial service, generates revenue, or is operated as a production business product, re-evaluate hosting and move to an appropriate commercial plan or alternative platform. Do not silently carry the hackathon hosting assumptions into production.

## Keep the deployment replaceable

Avoid unnecessary Vercel lock-in in the application core.

Recommended separation:

```text
forecast engine       -> pure TypeScript, platform-independent
household data        -> Supabase/Postgres
claim / stock actions -> application service layer
notifications         -> adapter interface
web UI                -> Next.js
hosting               -> Vercel for hackathon convenience
```

The forecast algorithm and domain model should not depend on Vercel-specific APIs.

## Human-required deployment steps

Codex should implement everything possible without waiting for credentials. When credentials are absent, use seeded demo data and mock/fallback adapters so development continues.

Human intervention should be limited to steps such as:

1. Create or select a Vercel account/project and connect `yo4e/Milk-Tomorrow`.
2. Create a Supabase project if real shared persistence is enabled.
3. Add required environment variables/secrets in Vercel/Supabase.
4. Create a Resend/email-provider API key and, if needed, complete domain/DNS verification.
5. Trigger/confirm the final production deployment.
6. Verify the public URL from an unauthenticated browser before Devpost submission.

Codex must document the exact required environment variables and any remaining manual setup in the README.

## No-credential fallback requirement

The repository must remain judgeable even if external service credentials are not yet configured.

At minimum, provide a **Demo Mode** that can demonstrate:

- a fictional household,
- forecasted milk depletion,
- weekend demand effects,
- an alert appearing,
- `I'll get it`,
- `We still have some`,
- claim-state coordination,
- purchase completion,
- forecast recalculation,
- reset / time travel.

External email delivery and production persistence are enhancements to the proof; they must not become single points of failure for completing the hackathon artifact.

## Final deployment priority

For this deadline, optimize in this order:

1. working public demo,
2. correct forecast + coordination loop,
3. stable mobile-friendly UX,
4. reliable seeded demo/reset,
5. real Supabase persistence,
6. real email delivery,
7. production hardening.

Do not sacrifice a functioning submission to build a more elaborate hosting architecture.
