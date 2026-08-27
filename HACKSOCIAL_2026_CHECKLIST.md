# Milk Tomorrow — HackSocial 2026 Rules Check and Submission Checklist

Last checked against primary sources and the actual submission form: **August 27, 2026**

- Official event page: https://hacksocial2026.devpost.com/
- Official Rules: https://hacksocial2026.devpost.com/rules
- Submitted project: https://devpost.com/software/milk-tomorrow
- Submitted project copy and record: [`DEVPOST_SUBMISSION.md`](DEVPOST_SUBMISSION.md)

## Verified event facts

| Item | Current official information |
|---|---|
| Event | HackSocial 2026, online and public |
| Published event period | August 1–31, 2026 |
| Submission deadline | August 31, 2026 at 5:00 PM EDT |
| Japan deadline | September 1, 2026 at 6:00 AM JST |
| Target track | Lifestyle Hacks Track |
| Track description | Anything affecting day-to-day life, including health and daily life |
| Headline eligibility | Age 13+, students only, companies/professional organizations excluded, standard regional exceptions |
| Team size | 1–4; every member must be individually registered and eligible |
| Required submission core | Text description, problem, and a way for judges to evaluate the project |
| Accepted evaluation examples | Demo video, live link, or source repository |
| Overview wording | GitHub repository/code or working prototype; project description covering inspiration, tech stack, and learning |
| Screenshots | Optional but encouraged on the Overview |
| Video | Not stated as mandatory in the Overview or Rule 3.5 |
| Judging criteria | Technical Execution; Innovation & Creativity; User Interface and Design |
| IP | Participant retains ownership; submission grants organizers/sponsors a promotional-use license for project name, description, media, and screenshots |
| Third-party work | Participant is responsible for license compliance and non-infringement |

## Why Milk Tomorrow fits

Milk Tomorrow addresses a repeating day-to-day household friction: noticing a likely shortage, deciding how much to buy, and preventing duplicate or missing action. The working loop is directly testable and does not need a forced health, social-infrastructure, or runtime-AI claim to fit Lifestyle Hacks.

| Official criterion | Strongest evidence |
|---|---|
| Technical Execution | Pure TypeScript engine, 1,000 seeded paths, quantiles, timezone behavior, weekend counterfactual, tested state machine, Web Locks, tab synchronization, eleven domain tests. |
| Innovation & Creativity | Demand forecasting turns a shopping list from a reactive note into a proactive family action before the shelf is empty. |
| User Interface and Design | `89% → 2 bottles → I’ll get it`, responsive mobile-first UI, accessible controls, and progressive disclosure in Tomorrow Lab. |

## Official-page defects and documented interpretation gap

The current official pages are not internally complete:

- The 2026 Overview says “To officially enter HackSocial **2025**.”
- It says participants can choose from three tracks but lists four.
- The delivered Rules page jumps from the eligibility heading to clause 1.3; clauses 1.1–1.2 are absent.
- It jumps from the project-requirements heading to clause 3.5; clauses 3.1–3.4 are absent.
- The visible official text does not explicitly address projects prepared for another event, previous submission, cross-submission, or whether registration must precede project work.

The participant chose to submit with the original history and this gap disclosed. This record does not interpret the missing text as organizer approval and does not claim that an organizer confirmation was received.

## Build-period evidence

All recorded project work currently predates the deadline and falls inside HackSocial's published August 1–31 event period:

| August 21, 2026 (JST) | Git evidence |
|---|---|
| Product, implementation, and deployment planning | `7c5061b`, `4af35f1`, `4db6ccc` |
| Working app, forecast engine, coordination, tests, and visual implementation | `a8a5234` |
| Static packaging and GitHub Pages deployment | `d9ff177` through `06e84e9` |
| Public documentation and submission artwork | `d5088f4` / PR #3 |
| Optional video scenario | `1d40a91` |

The historical planning documents openly show that Milk Tomorrow was initially framed for another hackathon. Do not remove that history or imply that the project was conceived exclusively for HackSocial.

## Organizer question retained for provenance

This question was drafted but not sent. The participant chose not to make it a submission blocker:

> Milk Tomorrow's Git history shows that its planning, implementation, tests, deployment, and assets were created on August 21, 2026, within HackSocial 2026's published August 1–31 event period. The repository was initially framed for another hackathon, and that history is disclosed publicly. The current Rules page omits sections 3.1–3.4 and does not explicitly address prior-event preparation or cross-submission. Is this project eligible for the Lifestyle Hacks Track if submitted with that full disclosure, and are there any additional requirements concerning prior work, registration timing, or submission to another event?

## Submitted materials

- [x] Public credential-free demo: https://yo4e.github.io/Milk-Tomorrow/
- [x] Public source: https://github.com/yo4e/Milk-Tomorrow
- [x] HackSocial-specific submitted story in `DEVPOST_SUBMISSION.md`
- [x] Lifestyle Hacks fit and exact judging-criteria alignment
- [x] Six-step reviewer test loop
- [x] Known limitations and privacy statement
- [x] Human, AI-assistance, generated-asset, and third-party disclosures
- [x] Git-based event-period and prior-work disclosure
- [x] 3:2 gallery thumbnail
- [x] Current 393 × 852 live-product screenshot used on Devpost
- [x] Optional 2:50 video scenario; not treated as a submission blocker

## Final technical verification — August 27, 2026

The final verification commands were run successfully:

```bash
cd app
npm ci
npm test
npm run check:runtime
npm run build
npm run test:sites
```

- 11 domain tests passed.
- Mobile runtime integrity passed for 28 protected files.
- The production build passed.
- 4 Sites worker tests passed.

Then verify manually:

- Reset restores `89% / 2 bottles / +7 pts`.
- Tomorrow Lab opens and its assumptions remain readable.
- Two same-origin tabs can choose different members; one claim updates both.
- The claimant can record two bottles and the seeded near-term display moves to `0%`.
- “We still have some” followed by “Move to tonight” produces the documented bounded-correction flow.
- The public URL works signed out and with empty local storage.
- The main flow remains usable near `393 × 852` and on desktop.
- No secret, credential, private data, local-only WAV, or unintended build output is committed.

## Final submission record

- [x] 山田佳江 joined and registered as the solo participant on Devpost.
- [x] Participant confirmed the registration eligibility statements, including age, student status, and region/jurisdiction.
- [x] Re-read the official pages and actual form on August 27, 2026.
- [x] The form exposed no track selector; the submitted story explicitly targets **Lifestyle Hacks Track**.
- [x] Checked the actual required fields and completed the optional contribution field.
- [x] Uploaded the primary thumbnail, current product screenshot, and social preview.
- [x] Verified the public demo and repository.
- [x] Omitted the optional video because the visible rules and actual form did not require one.
- [x] Preserved disclosures for generated artwork, dependencies, limitations, AI assistance, and prior context.
- [x] Added the participant-approved [MIT License](LICENSE).
- [x] Previewed and submitted the project on August 27, 2026: https://devpost.com/software/milk-tomorrow
- [ ] Keep the repository and demo public through the judging period required by the organizer.

## Do not claim

- Cross-device or server-authoritative household synchronization.
- Authentication, scheduled forecasts, email/SMS delivery, sensors, Supabase/Postgres, or production persistence as current features.
- That the model observes the refrigerator or knows an exact empty time.
- Runtime LLM or trained machine-learning behavior; the current engine is a seeded Monte Carlo simulation.
- Measured adoption, savings, waste reduction, or social impact without new evidence.
- That the entire project was created exclusively for HackSocial.
