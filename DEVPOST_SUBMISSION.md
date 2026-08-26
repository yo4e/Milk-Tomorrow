# Milk Tomorrow — HackSocial 2026 Devpost Submission

- **Target:** HackSocial 2026 · Lifestyle Hacks Track
- **Official sources checked:** August 26, 2026

- Event page: https://hacksocial2026.devpost.com/
- Official Rules: https://hacksocial2026.devpost.com/rules
- Published deadline: **August 31, 2026 at 5:00 PM EDT** (**September 1, 2026 at 6:00 AM JST**)

The English project story below is paste-ready. The eligibility and prior-work confirmation at the end is intentionally not marked complete because the official Rules omit the clauses that would normally answer it.

## Official requirement snapshot

The event page currently publishes:

- Student participation, age 13+, with companies/professional organizations excluded.
- An online, public event running August 1–31, 2026.
- **Lifestyle Hacks Track:** projects affecting day-to-day life.
- Required submission core: source/code or a working prototype plus a project description covering inspiration, technology, and learning.
- Screenshots or UI mockups as optional but encouraged.
- Judging criteria: **Technical Execution**, **Innovation & Creativity**, and **User Interface and Design**.

Rule 3.5 requires a text description, the problem, and a way for judges to evaluate the project; it gives a demo video, live link, or source repository as examples. A video is therefore **not stated as mandatory**.

### Official-page gaps that need human confirmation

- The Overview says “To officially enter HackSocial **2025**” on the 2026 page.
- The Overview says there are three tracks but lists four.
- The published Rules jump from eligibility heading 1 to clause 1.3 and from project-requirements heading 3 to clause 3.5; clauses 1.1–1.2 and 3.1–3.4 are absent from the delivered page.
- Neither visible official page explicitly states whether a project prepared for another hackathon or submitted elsewhere may also enter HackSocial 2026.

Do not interpret silence as permission. Use the organizer question in the final checklist before submission.

---

## Project name

**Milk Tomorrow**

## Short tagline

**The shopping list that writes itself—before the milk is gone.**

## Inspiration

Household shopping lists begin too late: after somebody notices an empty shelf. That causes two ordinary but persistent failures. Sometimes nobody buys the milk because everyone assumes another person will. Sometimes several people buy it because they notice independently.

Milk Tomorrow starts earlier. It is designed for busy families—including parents and children who should not need to understand inventory software—to answer three questions before breakfast:

1. Are we likely to run short?
2. How much should somebody buy?
3. Who has the trip covered?

## What it does

Milk Tomorrow models a household's consumption rhythm, forecasts a likely shortage before the milk is gone, recommends a practical quantity, and lets one family member claim the task for everyone.

The reset demo keeps the main decision calm and concrete: **89% chance of running short, pick up 2 bottles, I'll get it.** Underneath that screen, it:

- runs 1,000 possible consumption futures;
- predicts crossing a one-breakfast, 340 ml safety reserve;
- recommends whole 1 L packages from a 90th-percentile 48-hour supply plan;
- explains the weekend effect with a weekday-only counterfactual;
- coordinates one winning claim between tabs in a supported browser;
- updates both tabs when the trip is claimed or completed;
- adds the recorded purchase and reruns the forecast, moving the seeded near-term result to 0%;
- treats “We still have some” as bounded feedback rather than a fabricated stock measurement; and
- exposes the math, assumptions, activity, member switching, time travel, and reset in Tomorrow Lab.

## How we built it

The forecast and coordination logic are pure TypeScript modules. For every future hour, the engine samples whether each fictional household member consumes milk, using weekday/weekend participation and hour-of-day weights, then samples a bounded serving amount. One thousand paths produce an empirical shortage probability, remaining-stock quantiles, median threshold-crossing time, and 90th-percentile purchase plan.

A second simulation replaces weekend probabilities with weekday probabilities. The difference explains the visible `+7` percentage-point weekend effect in the reset scenario instead of attaching a vague “weekends are busier” label.

The interface uses React and Vite with a mobile-first responsive layout. Demo state uses localStorage, BroadcastChannel, storage events, and the Web Locks API. Web Locks serializes competing same-browser claim attempts in supported browsers; BroadcastChannel and storage events update other same-origin tabs. Eleven deterministic domain tests cover the forecast and coordination rules, with separate runtime-integrity, build, and static-hosting checks.

## Challenges

- Making a stochastic model reproducible for remote judging without hard-coding its output.
- Defining shortage responsibly as a safety reserve instead of claiming knowledge of literal emptiness.
- Turning a binary “still available” response into useful feedback without inventing precision.
- Preventing near-simultaneous claims while keeping a zero-credential demo easy to open.
- Preserving mathematical evidence in a screen simple enough for a non-technical family member.

## What we learned

The hardest part of household forecasting is not adding more sensors. It is choosing honest abstractions. A safety reserve is more useful than a fake empty-time prediction. Coarse feedback can improve an estimate without becoming a false measurement. Coordination matters as much as prediction: even a correct alert fails if everybody—or nobody—acts on it.

## What makes it innovative

Milk Tomorrow is not another shared shopping list. **The list writes itself before the item is gone.**

The project brings demand forecasting—usually associated with warehouses and supply chains—into one tiny, familiar household decision. Its technical depth is mostly invisible until a judge opens Tomorrow Lab. That contrast between a child-friendly surface and a serious, inspectable probabilistic engine is the core product idea.

## Why it fits the Lifestyle Hacks Track

Milk Tomorrow addresses a small but repeating part of day-to-day life: noticing, planning, and coordinating a household purchase. It makes daily life easier by moving the shopping decision before the shortage and combining prediction, quantity, and responsibility in one flow. The project does not need to stretch into health, runtime AI, or large-scale social infrastructure to fit this track; its value is removing an everyday household friction before it becomes urgent.

## Judging criteria alignment

| Official criterion | Evidence in the working prototype |
|---|---|
| Technical Execution | Pure TypeScript forecast engine, 1,000 seeded paths, quantile-based planning, timezone logic, weekend counterfactual, tested coordination state machine, Web Locks, tab synchronization, and eleven deterministic domain tests. |
| Innovation & Creativity | The list is created by forecasted need before a human notices the shortage; household-scale demand forecasting becomes a friendly family action. |
| User Interface and Design | The main screen reduces the model to `89% → 2 bottles → I’ll get it`, with responsive layouts, large actions, clear state changes, accessible controls, and progressive disclosure through Tomorrow Lab. |

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
- Playwright tooling for mobile-runtime checks
- OpenAI Codex and OpenAI image generation, disclosed below

## Working demo and source

- **Live demo:** https://yo4e.github.io/Milk-Tomorrow/
- **Source repository:** https://github.com/yo4e/Milk-Tomorrow
- **Access:** no account, API key, database, or environment variable is required.

### Reviewer test loop

1. Reset and confirm `89% / 2 bottles / +7 pts`.
2. Open **See the 1,000 simulated futures**.
3. Open a second tab and choose another household member in Tomorrow Lab.
4. Claim the trip in one tab and watch both update.
5. As the claimant, record **Bought 2 bottles** and confirm the near-term result moves to `0%`.
6. Reset, choose **We still have some**, then **Move to tonight** to see bounded feedback and re-evaluation.

## Gallery assets

- `submission-assets/milk-tomorrow-thumbnail.png` — 1536 × 1024 (3:2) primary gallery image.
- `app/design/implementation-home-forecast-393x852.jpg` — real mobile product screenshot.
- `submission-assets/milk-tomorrow-social-preview.png` — 1200 × 630 link preview.

## Known limitations and responsible delivery

- Forecasts are probabilities, not promises; “running short” means crossing a 340 ml safety reserve.
- The demo uses a fixed clock and a fictional Sakura household with synthetic profiles.
- Same-browser, same-origin synchronization is not cross-device household persistence.
- Authentication, backend storage, scheduled forecasts, and notifications are roadmap items, not current capabilities.
- The app estimates stock from starting state, purchase events, and coarse observations; it does not observe the refrigerator.
- “We still have some” never becomes a made-up exact measurement.
- Demo Mode collects no account, personal, precise-location, receipt, or credential data.
- The current prototype does not use an LLM, external API, or external dataset at runtime.

## AI, third-party, and generated-asset disclosure

- 山田佳江 originated and directed the concept, selected the visual direction, made product and technical-priority decisions, tested the experience, and owns the submission and presentation.
- OpenAI Codex assisted with implementation, testing, browser verification, and documentation under human direction.
- OpenAI image generation created design directions and the fictional milk, cloud, family, and submission artwork. No real person's likeness or personal data was used.
- The initial written product design is credited to 月野さん in the historical planning documents.
- Third-party libraries, fonts, tooling, and the mobile runtime are listed in `README.md` and `app/package.json`.
- Credential-free Demo Mode uses no external API or dataset.

AI tools are disclosed as tools, not team members.

## Participant contribution

- **山田佳江** — product origin and direction, visual-direction selection, product and technical-priority decisions, experience testing, submission ownership, and presentation.

## Build-period and prior-work disclosure

HackSocial's official Rules state an event period of **August 1–31, 2026**. Git history shows that Milk Tomorrow's planning documents, application, forecast engine, coordination flow, tests, visual implementation, hosting setup, and submission assets were committed on **August 21, 2026 (JST)**, inside that published period.

The repository's original documents framed the work for another hackathon. This history has not been removed or rewritten. The visible HackSocial Rules do not explicitly address projects prepared for another event, prior entries, or cross-submission, and clauses 3.1–3.4 are absent from the delivered Rules page. Organizer confirmation is therefore required before representing the project as eligible.

## Optional video

The official submission language accepts a live link or source repository as a way for judges to evaluate the project and does not state that a video is mandatory. The current public demo, source, reviewer loop, and screenshots satisfy the documented evaluation path without a video.

`VIDEO_SCENARIO.md` remains available as an optional 2:50 promotional/demo asset. Do not make final video production a HackSocial submission blocker unless the organizer or actual submission form adds a requirement.

## Human-only submission checklist

- [ ] Join HackSocial 2026 on Devpost and confirm the participant is individually registered.
- [ ] Confirm age 13+, current student status, region/jurisdiction eligibility, and any prize restrictions.
- [ ] Select **Lifestyle Hacks Track** in the actual submission form.
- [ ] Ask the organizer the prior-work question below and retain the answer.
- [ ] Re-read the Overview, Rules, Updates, and actual submission form immediately before submission because the Rules allow updates.
- [ ] Confirm the actual form does not add a mandatory field omitted from the public overview.
- [ ] Upload the 3:2 thumbnail and product screenshot if the gallery remains optional/encouraged.
- [ ] Verify the public demo and repository signed out.
- [ ] Re-run `npm test`, `npm run check:runtime`, `npm run build`, and `npm run test:sites`.
- [ ] Confirm all third-party dependencies and generated assets comply with their licenses and HackSocial's promotional-use license.
- [ ] Decide deliberately whether the repository should remain all-rights-reserved without a `LICENSE` file or receive a participant-approved license.
- [ ] Keep the demo and repository public through the required judging period.
- [ ] Submit before **September 1, 2026 at 6:00 AM JST**; do not rely on a last-minute timezone conversion.

### Organizer question to send

> Milk Tomorrow's Git history shows that its planning, implementation, tests, deployment, and assets were created on August 21, 2026, within HackSocial 2026's published August 1–31 event period. The repository was initially framed for another hackathon, and that history is disclosed publicly. The current Rules page omits sections 3.1–3.4 and does not explicitly address prior-event preparation or cross-submission. Is this project eligible for the Lifestyle Hacks Track if submitted with that full disclosure, and are there any additional requirements concerning prior work or submissions to another event?
