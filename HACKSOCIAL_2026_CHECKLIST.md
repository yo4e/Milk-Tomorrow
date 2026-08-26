# Milk Tomorrow — HackSocial 2026 Rules Check and Submission Checklist

Last checked against primary sources: **August 26, 2026**

- Official event page: https://hacksocial2026.devpost.com/
- Official Rules: https://hacksocial2026.devpost.com/rules
- Paste-ready project copy: [`DEVPOST_SUBMISSION.md`](DEVPOST_SUBMISSION.md)

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

## Official-page notes

The current official pages contain a few visible inconsistencies worth rechecking before submission:

- The 2026 Overview says “To officially enter HackSocial **2025**.”
- It says participants can choose from three tracks but lists four.

These do not currently change Milk Tomorrow's submission path, but the live Overview, Rules, Updates, and actual form should be re-read immediately before submission.

## Submission materials ready now

- [x] Public credential-free demo: https://yo4e.github.io/Milk-Tomorrow/
- [x] Public source: https://github.com/yo4e/Milk-Tomorrow
- [x] HackSocial-specific paste-ready story in `DEVPOST_SUBMISSION.md`
- [x] Lifestyle Hacks fit and exact judging-criteria alignment
- [x] Six-step reviewer test loop
- [x] Known limitations and privacy statement
- [x] Human, AI-assistance, generated-asset, and third-party disclosures
- [x] 3:2 gallery thumbnail
- [x] Real mobile product screenshot
- [x] Optional 2:50 video scenario; not treated as a submission blocker

## Technical re-verification

Run immediately before submission:

```bash
cd app
npm ci
npm test
npm run check:runtime
npm run build
npm run test:sites
```

Then verify manually:

- Reset restores `89% / 2 bottles / +7 pts`.
- Tomorrow Lab opens and its assumptions remain readable.
- Two same-origin tabs can choose different members; one claim updates both.
- The claimant can record two bottles and the seeded near-term display moves to `0%`.
- “We still have some” followed by “Move to tonight” produces the documented bounded-correction flow.
- The public URL works signed out and with empty local storage.
- The main flow remains usable near `393 × 852` and on desktop.
- No secret, credential, private data, local-only WAV, or unintended build output is committed.

## Human-only final checklist

- [ ] Join the event and confirm 山田佳江 is individually registered on Devpost.
- [x] Student status is participant-confirmed; ensure the Devpost registration reflects it accurately.
- [ ] Confirm age 13+, regional/jurisdiction eligibility, and any tax, sanctions, export-control, or prize restrictions.
- [ ] Select **Lifestyle Hacks Track** in the actual submission form.
- [ ] Re-read the Overview, Rules, Updates, and actual form immediately before submission; the Rules allow updates.
- [ ] Confirm the actual form has no required field omitted from the public Overview.
- [ ] Upload the primary thumbnail and real product screenshot.
- [ ] Do not produce a final video unless the actual form makes it necessary or the participant chooses it as optional promotion.
- [ ] Confirm generated artwork and every third-party dependency comply with their license and HackSocial's promotional-use terms.
- [ ] Decide deliberately whether to keep the repository without a `LICENSE` file or add a participant-approved license; do not let an agent guess the rights holder's intent.
- [ ] Preview the final Devpost page and remove internal notes, unchecked boxes, or stale event references.
- [ ] Keep the repository and demo public through the judging period required by the organizer.
- [ ] Submit well before **September 1, 2026 at 6:00 AM JST**.

## Do not claim

- Cross-device or server-authoritative household synchronization.
- Authentication, scheduled forecasts, email/SMS delivery, sensors, Supabase/Postgres, or production persistence as current features.
- That the model observes the refrigerator or knows an exact empty time.
- Runtime LLM or trained machine-learning behavior; the current engine is a seeded Monte Carlo simulation.
- Measured adoption, savings, waste reduction, or social impact without new evidence.
