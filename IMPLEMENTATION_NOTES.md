# Milk Tomorrow — Implementation Notes

This document supplements `DESIGN.md`. Codex should read **both files** before implementation.

The purpose of this addendum is to lock down the notification-first UX, household/member data, and the implementation details most likely to cause trouble during the Proof of Possible 2026 build.

## 1. Product interaction: almost no app-opening required

Milk Tomorrow should not feel like another household app that users must remember to open and maintain.

The desired behavior is:

1. The household sets up members and rough consumption habits once.
2. Purchases are recorded occasionally.
3. Milk Tomorrow runs forecasts in the background.
4. When an item is likely to run out soon, the family receives a notification.
5. The recipient should normally need only **one tap**.

For the hackathon MVP, prefer **email notifications** over SMS. SMS adds phone-number handling, cost, provider setup, and country-specific behavior. Email also allows a visually clear two-action message and is easy to demonstrate remotely.

Example:

> 🥛 **Milk Tomorrow**  
> Milk may run out tomorrow morning.  
> Recommended: **2 bottles**
>
> **[ I'll get it ]   [ We still have some ]**

The app itself should remain available for setup, forecasts, history, corrections, and demo mode, but everyday use should be notification-driven.

## 2. The two notification actions

### A. “I’ll get it”

This is the primary action.

When a member chooses it:

- atomically claim the open replenishment request,
- identify the member from the signed notification action token,
- update the shared household state,
- notify the other household members that the task is taken,
- show a friendly success page immediately.

Suggested success copy:

> **Thank you! 🥛✨**  
> You’ve got the milk.

The success state should feel warm and slightly celebratory rather than administrative. A small milk-bottle bounce, sparkle, confetti burst, or similar lightweight effect is encouraged.

Respect `prefers-reduced-motion`; animation must not be required to understand the state.

After claim, the rest of the family should receive something like:

> **Dad is getting the milk.**  
> You don’t need to buy it.

This coordination moment is one of the strongest demo moments in the product.

### B. “We still have some”

This is not merely a dismiss button. It is feedback to the forecast.

Clicking it should:

- record a `StockObservation` that stock was still available at that time,
- close or snooze the current replenishment request,
- prevent immediate duplicate alerts,
- recalculate / modestly correct the forecast,
- create a useful training signal for later adaptive forecasting.

Important: **do not pretend to know the exact remaining amount** from this binary response.

For the MVP, a safe heuristic is preferable to fabricated precision. Recommended behavior:

- record `still_available` at `observed_at`,
- suppress the same shortage alert for a configurable period (for example 12–24 hours),
- slightly reduce the estimated consumption rate or extend the forecast using a conservative bounded correction,
- allow the normal forecast engine to evaluate again after the snooze period.

Keep the raw observation in the database even if the adaptive correction is not implemented in the hackathon version.

## 3. Email action security and one-tap behavior

Email links can be fetched automatically by spam filters and link-preview/security scanners. Therefore **a GET request must never directly mutate inventory or claim a task**.

Recommended pattern:

1. Each email button contains a short-lived signed action URL with:
   - request ID,
   - member ID,
   - intended action,
   - nonce,
   - expiry.
2. GET opens a tiny mobile-first action page.
3. The browser performs the actual mutation using POST after the page is opened interactively.
4. The token is one-time / idempotent.
5. The backend validates signature, expiry, household membership, request state, and action before mutation.

For the intended UX, the page may automatically POST after a real browser navigation so the user still experiences one tap from the email. The backend GET itself must remain side-effect free.

If this proves unreliable across environments during the hackathon, fall back to a tiny confirmation page rather than risking accidental claims from email scanners.

## 4. Household data and member profiles

Use the shared database, not browser `localStorage`, for household configuration. Multiple family members and email action links need a common source of truth.

Recommended storage: **Supabase / Postgres**, matching `DESIGN.md`.

### Household

Suggested fields:

```text
id
name
timezone
created_at
```

`timezone` is required. The server may run in UTC while a household’s Friday/Saturday boundary is local. The demo household should use an explicit timezone such as `Asia/Tokyo`.

### Member

Suggested fields:

```text
id
household_id
auth_user_id nullable
display_name
email
notifications_enabled
created_at
```

For the hackathon demo, full account creation for every family member is optional. A seeded household plus signed per-member email action tokens is sufficient if access controls are otherwise safe.

### MemberItemProfile

Consumption habits should be stored per member **and per item**, because a person may never eat cereal but still consume milk in coffee, etc.

Suggested fields:

```text
id
member_id
item_id
weekday_probability
weekend_probability
portion_amount
created_at
updated_at
```

Examples:

- Daughter: cereal weekday `0.0`, weekend `0.0`
- Younger son: cereal weekday `0.5`, weekend `0.5`
- Parent: milk weekday `0.7`, weekend `1.0`

Internally, probabilities/weights can be numeric (`1.0`, `0.5`, `0.2`, `0.0`). The UI should not make the user think in probabilities.

Use friendly presets such as:

- Almost every day → `1.0`
- About half the time → `0.5`
- Sometimes → `0.2`
- Never → `0.0`

The forecast can then use expected consumption:

```text
expected member consumption
  = probability × portion_amount

expected household consumption
  = Σ expected member consumption
```

Separate weekday/weekend values make statements like “Dad eats breakfast away from home on weekdays” easy to model without a complicated calendar system.

## 5. Onboarding must solve the starting-stock problem

A forecast cannot begin without some notion of current stock.

Do not require users to weigh or count everything precisely. For each tracked item, onboarding should ask for only enough information to initialize the model.

Possible minimal setup:

- package size (e.g. 1 L bottle),
- typical purchase quantity (e.g. 2 bottles),
- approximate stock now or a recent purchase event,
- usual per-member consumption frequency / portion.

For the hackathon demo, seed this data automatically.

Long-term UX can offer coarse states such as:

- unopened / full,
- about half,
- almost empty,

but precise inventory entry is not a prerequisite for the MVP.

## 6. Notification delivery architecture

The forecast needs a scheduled execution path; opening the app cannot be the only trigger.

Recommended service boundary:

```text
runForecasts(now)
  -> update estimated stock
  -> calculate predicted run-outs
  -> create/reuse replenishment requests
  -> enqueue notifications
```

Expose the same service through:

- a protected scheduled/cron endpoint for real operation,
- Demo / Time Travel mode for the hackathon.

This lets the demo prove exactly the same logic that a scheduler would call in production.

Do not let cron/provider setup block the submission. If necessary, implement the endpoint and demonstrate it through the time-travel control first, then connect a scheduler afterward.

## 7. Notification idempotency: avoid family spam

A scheduler may run repeatedly while the same milk shortage remains imminent. It must not send “buy milk” every hour.

Requirements:

- At most one active replenishment request per item/household at a time.
- Re-running the forecast should reuse the existing request when appropriate.
- Notifications should have a deduplication key.
- `still_available` should create a snooze window.
- A claimed request must not generate new “who will buy this?” messages unless it expires or is reopened intentionally.

A database constraint or transaction is preferable to relying only on application logic.

## 8. Claim concurrency remains mandatory

As specified in `DESIGN.md`, two members may click “I’ll get it” at nearly the same moment.

Only one can win.

The claim must be an atomic conditional update/transaction. The losing action should render a friendly state such as:

> **Already covered! ✨**  
> Dad is getting the milk.

This is not an error page; it is proof that the coordination system worked.

## 9. Household notifications after claim

When a request changes from `open` → `claimed`, notify the remaining members.

For the MVP, the preferred order is:

1. update database atomically,
2. show success immediately to claimant,
3. write household activity event,
4. send/update in-app state,
5. send family email notification asynchronously.

Do not make the claimant wait for every outbound email to be delivered before seeing “Thank you!”.

## 10. Purchase completion and forgotten claims

Claiming is not the same as purchasing.

A claimed request needs a completion action such as:

> **[ Bought 2 bottles ]**

Completion should:

- create the purchase event,
- add stock,
- close the request,
- recalculate the next run-out,
- show the new forecast.

Possible future failure mode: somebody claims milk and forgets to buy it. For the hackathon, it is enough to keep the claimed task visible. A later version can expire claims, remind the assignee, or reopen the task.

Do not spend MVP time on a sophisticated claim-expiration system unless the core loop is already polished.

## 11. Data drift and correction

Because there is no physical sensor, estimated stock will drift from reality.

This is expected and should be handled gracefully rather than hidden.

MVP correction signals:

- `still_available` from the notification,
- purchase events,
- optional manual “adjust stock” in item detail.

Future signals:

- “we ran out early”,
- receipt/barcode events,
- learned intervals between purchases.

The product should present forecasts as estimates and make corrections cheap.

## 12. Unit handling

Avoid building a universal measurement-conversion engine during the hackathon.

Each item should have one canonical unit:

- milk: `ml`,
- cereal: `g`,
- eggs: `count`,
- toilet paper: `roll`.

Store package size in that same unit and round suggested purchases to packages.

This is enough to prove the concept and keeps forecast code testable.

## 13. Item dependencies are real but out of MVP scope

Milk and cereal are not truly independent: if cereal is gone, cereal-related milk consumption may fall too.

Do **not** implement a dependency graph for the hackathon unless everything else is complete.

For the MVP, each item has its own direct member consumption profile. This keeps the simulation explainable and avoids cascading edge cases.

List cross-item dependencies as future work.

## 14. Timezone and calendar pitfalls

All forecast calculations involving weekday/weekend must use the household timezone, not server timezone.

Required tests:

- Friday night in Japan must not accidentally be treated as Friday morning/Thursday due to UTC.
- advancing Demo Time across midnight must change the correct local day.
- DST-safe logic should be used even though the demo household may be in Japan.

Prefer a timezone-aware date library / API rather than manual offset arithmetic.

## 15. Suggested notification provider strategy

Do not couple the domain model to a specific email vendor.

Create an interface such as:

```text
NotificationProvider.sendReplenishmentAlert(...)
NotificationProvider.sendClaimedUpdate(...)
```

Implement:

- `ConsoleNotificationProvider` for local/tests,
- `EmailNotificationProvider` for deployed demo when credentials are available.

This lets Codex finish the product even if domain verification or email-provider setup becomes a last-minute problem.

For remote judging, real email is high-value but should not be allowed to break the core demo.

## 16. UI direction

The interface should be **cute, simple, domestic, and calm**.

Avoid:

- enterprise dashboard aesthetics,
- dense tables,
- excessive settings,
- warehouse/inventory language.

Prefer:

- generous whitespace,
- one clear household need per card,
- friendly item icons/illustrations,
- large mobile tap targets,
- warm microcopy,
- small celebratory feedback when somebody volunteers.

The notification experience is the hero UX. The dashboard is supporting evidence.

## 17. New data entity: StockObservation

Add this alongside the `DESIGN.md` schema:

```text
StockObservation
id
item_id
member_id nullable
kind                 # still_available | manual_adjustment | ran_out_early (future)
observed_at
metadata jsonb nullable
created_at
```

For the MVP, `still_available` is sufficient.

## 18. Additional tests

Add to the existing test requirements:

1. Repeated forecast runs do not create duplicate open requests.
2. Repeated notification jobs do not send duplicate alerts for the same request/member.
3. `still_available` records an observation and suppresses immediate re-alerting.
4. Expired or already-used email action tokens cannot mutate state.
5. GET requests to email action URLs have no side effects.
6. Two simultaneous email claim actions still produce exactly one claimant.
7. Forecast weekday/weekend logic respects `household.timezone`.
8. A successful claim can return before outbound family notification delivery finishes.

## 19. Hackathon implementation priority update

Given the short build window, prioritize in this order:

### P0

- forecast engine,
- seeded household/member/item profiles,
- household timezone,
- replenishment request generation,
- atomic claim,
- `still_available` observation/snooze,
- cute mobile action/result pages,
- Demo / Time Travel mode,
- in-app realtime state.

### P0.5 — very desirable

- real email alert with two action links,
- family email after claim,
- thank-you animation.

### P1

- persistent cron scheduling,
- adaptive learning from observations,
- richer onboarding,
- full authentication/invitations,
- push/SMS.

If email provider setup starts consuming disproportionate time, keep the provider abstraction, demonstrate the message/action flow with the local/demo provider, and return to real delivery only after the core end-to-end loop is solid.

## 20. Core UX sentence for Codex

When implementation choices are ambiguous, optimize for this behavior:

> **Milk Tomorrow quietly predicts household shortages in the background, asks the family only when action is needed, and lets each person resolve the situation with one tap.**
