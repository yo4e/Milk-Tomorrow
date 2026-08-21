# Devpost Submission Draft

This file is ready to paste into Devpost after the bracketed team and public-link fields are completed.

## Project name

**Milk Tomorrow**

## Short tagline

**The shopping list that writes itself—before the milk is gone.**

## Problem, users, and solution

Household shopping lists begin too late: after somebody notices an empty shelf. That causes two ordinary but persistent failures. Sometimes nobody buys the milk because everyone assumes another person will. Sometimes several people buy it because they notice independently.

Milk Tomorrow is for busy families, including parents and children who should not need to understand inventory software. It models a household's consumption rhythm, forecasts a likely shortage before the item is gone, recommends a practical quantity, and lets one family member claim the task for everyone.

The main screen says only what the family needs to know: **89% chance of running short, pick up 2 bottles, I'll get it.** Underneath that calm interface, a timezone-aware Monte Carlo engine simulates 1,000 possible futures using per-person weekday/weekend behavior, hour-of-day demand, and serving-size variation.

## What it does

- Predicts when milk will cross a one-breakfast safety reserve.
- Shows a probability and reason rather than pretending to know the future.
- Recommends whole packages from a 90th-percentile 48-hour supply plan.
- Quantifies the weekend effect with a counterfactual simulation.
- Allows one household member to atomically claim the milk run.
- Updates other open household tabs immediately so duplicate buying is prevented.
- Records purchase completion, replenishes estimated stock, and recalculates risk.
- Treats “We still have some” as a conservative observation: it snoozes, adjusts within a bound, and never fabricates the exact amount remaining.
- Includes a reproducible Tomorrow Lab for time travel, model inspection, member switching, and reset.

## How we built it

The forecast and coordination logic are pure TypeScript modules. For every future hour, the engine samples whether each household member consumes milk and then samples a bounded serving amount. One thousand paths produce an empirical shortage probability, remaining-stock quantiles, median threshold-crossing time, and 90th-percentile purchase plan. A second run holds weekend behavior to weekday levels to calculate the weekend lift.

The seeded demo uses React and a mobile-first responsive interface that fills a phone browser and becomes a centered, readable web app on desktop. Shared demo state uses localStorage, BroadcastChannel, storage events, and the Web Locks API. The lock serializes simultaneous claim attempts so only the first open-request transition wins. Domain behavior is covered by deterministic Node tests, while the rendered experience was exercised in two live browser tabs and compared at a 393 × 852 viewport against the selected visual design.

## What makes it original

Milk Tomorrow is not another shared shopping list. **The list writes itself before the item is gone.**

The product deliberately applies demand forecasting—a technique associated with warehouses and supply chains—to a tiny, familiar household problem. Its technical depth is mostly invisible until a judge opens Tomorrow Lab. That gap between a child-friendly surface and a serious probabilistic engine is the product's central design idea.

## Challenges

- Making a stochastic model reproducible enough for remote judging without hard-coding the output.
- Defining shortage responsibly as a safety reserve instead of claiming knowledge of literal emptiness.
- Turning a binary “still available” response into useful feedback without inventing precision.
- Preventing two near-simultaneous claims while keeping a zero-credential demo easy to open.
- Preserving mathematical evidence in a screen simple enough for a non-technical family member.

## Accomplishments

- The exact judge-facing `89% / 2 bottles / +7 weekend points` result comes from a deterministic 1,000-trial simulation.
- A completed two-bottle purchase moves the same near-term forecast to `0%`.
- Two tabs behave like two household members; only one claim wins and both update immediately.
- Risk level drives both language and action, so a low-risk result can never retain an urgent “high chance” purchase prompt.
- Eleven domain tests, a protected-runtime integrity check, production build, responsive checks, and source-vs-implementation design QA pass.

## What we learned

The hardest part of household forecasting is not adding more sensors. It is choosing honest abstractions. A safety reserve is more useful than a fake empty-time prediction. Coarse feedback can improve a forecast without becoming a false measurement. And coordination state matters as much as prediction: a correct alert still fails if everyone acts on it.

## What's next

The judgeable build intentionally needs no credentials. The next step is to keep that fallback while adding a Supabase/Postgres adapter for cross-device state, an atomic server claim transaction, realtime subscriptions, scheduled forecasts, and signed one-time email actions whose GET requests never mutate state. After that, onboarding can add more consumables through friendly frequency presets rather than probability fields.

## Technologies

- React 19 and React DOM
- TypeScript 7
- Vite 8
- Node's built-in test runner
- Radix UI primitives and icons
- Motion and `@use-gesture/react` through the mobile runtime
- Fontsource Nunito and Roboto
- Web Locks API
- BroadcastChannel and storage events
- localStorage for credential-free Demo Mode
- Playwright test tooling for protected mobile runtime checks
- OpenAI Codex and OpenAI image generation, disclosed below

## Working demo and source

- Demo: **[ADD PUBLIC DEMO URL]**
- Source: `https://github.com/yo4e/Milk-Tomorrow`
- Testing: no account is required. Open the demo and follow the README's six-step loop.

## Three-minute demonstration script

- **0:00–0:20 — Problem.** Show an empty milk carton and say: “Shopping lists start after someone notices. Milk Tomorrow starts before.”
- **0:20–0:45 — The simple surface.** Show Friday's `89%` forecast, `2 bottles`, and the one-tap actions.
- **0:45–1:10 — The mathematical reveal.** Open Tomorrow Lab: 1,000 futures, `+7` weekend points, 90% supply plan, and the 340 ml reserve definition.
- **1:10–1:30 — Honest feedback.** Tap “We still have some,” show the 12-hour snooze, then move to tonight. Explain that stock ages while time passes and the forecast reopens if the shortage is still real. Reset.
- **1:30–2:10 — Coordination proof.** Put Aki and Ken in two tabs. Tap “I'll get it” as Aki. Show both tabs update and Ken's action disable with Aki's name.
- **2:10–2:30 — Close the loop.** Tap “Bought 2 bottles.” Show both tabs update and risk move to `0%`.
- **2:30–2:50 — Technical evidence.** Briefly show the simulation module and passing domain tests. State that no external credentials are required.
- **2:50–3:00 — Close.** “Milk Tomorrow: serious forecasting, one friendly household decision.”

## Judging alignment

| Criterion | Evidence |
|---|---|
| Real-World Value — 25% | A frequent household failure, specific family users, and an end-to-end replenishment loop. |
| Technical Execution — 25% | 1,000-path simulation, quantiles, counterfactual, timezone logic, tested state machine, atomic tab claims, instant shared updates. |
| Originality — 20% | Demand forecasting writes the shared list before a human notices the shortage. |
| Usability and Design — 15% | One-screen mobile-first responsive flow, large actions, friendly copy, phone-to-desktop resilience, model details disclosed progressively. |
| Responsible Delivery — 15% | Probabilistic language, explicit reserve, synthetic data, bounded feedback, no credentials, honest cross-device limitation, full AI/asset disclosure. |

## Work completed during the hackathon

Before implementation, the repository contained only `DESIGN.md`, `IMPLEMENTATION_NOTES.md`, and `DEPLOYMENT_NOTES.md`. All application code, tests, generated art, selected visual direction, responsive UI, simulation and coordination logic, Tomorrow Lab, browser interaction verification, and design-QA evidence under `app/` were created during the hackathon build.

## AI, pre-existing work, and third-party disclosures

- OpenAI Codex assisted with implementation, testing, browser verification, and documentation under human direction.
- OpenAI image generation created the visual directions and the fictional milk, cloud, and family assets.
- The three root planning documents were pre-existing product guidance. The initial product design was written by 月野さん.
- Third-party libraries and templates are listed in the README and `app/package.json`.
- The demo uses no external API or dataset and contains no real household data.

## Team contributions

- **[PARTICIPANT NAME]** — product direction, visual selection, product decisions, testing, submission, and presentation.
- **[ADD TEAM MEMBER IF APPLICABLE]** — [SPECIFIC CONTRIBUTION].

Remove unused team lines before submission. AI tools are disclosed as tools, not listed as team members.

## Known limitations, risks, and privacy

- The current zero-credential shared state works between tabs in one browser, not between separate devices.
- Authentication, server-authoritative persistence, scheduled execution, and email delivery are future adapters, not demonstrated production capabilities.
- The model estimates stock from events and coarse feedback; it does not observe the refrigerator.
- Household profiles are synthetic and fixed in this narrow proof.
- Forecasts can be wrong. The UI presents probability and reason, and always allows correction.
- Demo Mode collects no account, personal, location, receipt, or credential data.

## Submission checklist

- [ ] Resolve the contradictory Devpost overview/rules dates, eligibility, and prize statements with the organizer.
- [ ] Confirm every participant is eligible and registered.
- [ ] Replace the public demo URL placeholder.
- [ ] Replace the team-contribution placeholders.
- [ ] Record and publish a video no longer than three minutes.
- [ ] Confirm the repository and demo remain public through judging.
- [ ] Test the public demo in a signed-out browser and on a phone.
- [ ] Re-run `npm test`, `npm run check:runtime`, `npm run build`, and `npm run test:sites`.
- [ ] Confirm no secret, private data, or unpublished credential is committed.
