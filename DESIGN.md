# Milk Tomorrow — Implementation Design

> **Know what your family will need before it runs out.**

## 1. Project context

**Hackathon:** Proof of Possible 2026  
**Devpost:** https://proof-of-possible-2026.devpost.com/

Milk Tomorrow is being built as a new project for the hackathon. The goal is not to pitch a large future platform, but to produce a small, working piece of evidence: a household can predict an everyday shortage *before* anyone notices the shelf is empty, then coordinate who will replenish it without duplicated effort.

The hackathon explicitly welcomes software products and does not require a specific API. AI-assisted development is allowed. Milk Tomorrow should therefore use the simplest reliable technical approach rather than adding an LLM or AI feature merely for appearance.

Before final submission, re-check the live Devpost page and rules because event details displayed by Devpost may change.

---

## 2. Core concept

Most shared shopping-list apps begin **after a human notices something is missing**.

Milk Tomorrow begins earlier.

A household tells the app roughly:

- who lives in the household,
- which people usually consume each item,
- how quickly an item is normally consumed,
- whether consumption changes on weekdays, weekends, holidays, etc.,
- how much was purchased and when.

The app then simulates future consumption and predicts likely run-outs.

Example:

> It is Friday.  
> The household has five people.  
> Milk consumption is higher on weekends.  
> The remaining milk is predicted to run out Saturday morning.  
> Milk Tomorrow sends: **“Milk is likely to run out tomorrow. Buy 2 bottles.”**

Every household member receives the request. One person taps **“I’ll get it.”** The app immediately changes the shared state and informs the others:

> **Dad is getting the milk.**

Everyone else now knows not to buy it.

The product therefore solves two related household coordination failures:

1. **Nobody buys it** because nobody notices soon enough or everyone assumes somebody else will.
2. **Everybody buys it** because several people independently notice the same shortage.

### One-sentence product definition

**Milk Tomorrow is a predictive household replenishment app that forecasts when everyday supplies will run out and lets one family member claim the restocking task for everyone.**

---

## 3. Product thesis

The central idea is **not inventory management**.

The user should not have to count the refrigerator every day.

The central idea is:

> **Household consumption has rhythms. A small amount of information can be used to predict the next shortage.**

Milk Tomorrow treats a household as a tiny demand-forecasting system.

This is intentionally much simpler than an IoT smart refrigerator. No cameras, scales, RFID tags, or dedicated hardware are required. The application estimates future stock from occasional human events (“we bought two bottles”) plus a transparent consumption model.

### Product principle

**Record purchases, not every consumption event.**

If the user must log every bowl of cereal or every glass of milk, the product has failed.

---

## 4. Hackathon framing

Milk Tomorrow should be presented as a small, complete invention rather than a generic shopping-list app.

### Real-world value

The problem is mundane, frequent, and instantly understandable: households repeatedly run out of milk, eggs, cereal, toilet paper, detergent, pet food, diapers, coffee, rice, and other predictable consumables.

### Technical execution

The technical centerpiece is the **consumption simulator / run-out prediction engine**, not a chatbot.

The prototype should visibly calculate:

- estimated current stock,
- expected consumption by day,
- predicted run-out date/time,
- recommended purchase quantity,
- current assignee for replenishment.

### Originality

Do not describe Milk Tomorrow primarily as a shared shopping list.

The differentiator is:

> **The list writes itself before the item is gone.**

### Usability

The main interaction should be understandable without instructions:

1. “Milk may run out tomorrow.”
2. “Buy 2.”
3. `[I’ll get it]`
4. “Alex is getting the milk.”

### Responsible delivery

The prediction must be presented as an estimate, not certainty. Keep the model inspectable and explainable. Avoid collecting unnecessary personal or location data. The hackathon demo should use a fictional household and synthetic usage data.

---

## 5. MVP scope

The MVP must prove one loop end-to-end:

> **purchase → simulated consumption → predicted shortage → shared alert → one person claims task → everybody sees assignment → purchase replenishes stock**

### P0 — required for submission

#### A. Household

Create or load one household with multiple members.

Minimum fields:

- household name
- member ID
- display name

For the demo, authentication may be deliberately lightweight if necessary, but the data model must support multiple household members.

#### B. Consumable items

Each household can track items such as:

- Milk
- Cereal
- Eggs
- Toilet paper
- Coffee

Minimum item fields:

- name
- unit (`ml`, `g`, `count`, `roll`, etc.)
- package size
- current estimated stock
- safety threshold / desired reserve
- default purchase quantity

#### C. Consumption profile

Each item has a simple demand profile.

Minimum:

- baseline daily consumption
- weekday multiplier
- weekend multiplier

Preferred:

- per-member participation / consumption weight

Example:

- five-person household
- three people usually drink milk on weekdays
- five people consume milk on weekends

The UI does not need to expose advanced mathematics. Use human language such as:

- “Weekdays: about 600 ml/day”
- “Weekends: about 1,000 ml/day”

#### D. Purchase event

User can record:

> `Bought 2 × 1L milk`

This increases estimated stock and records the timestamp.

A one-tap **Bought** action is more important than a detailed receipt-entry system.

#### E. Forecast engine

Given the current estimated stock and consumption profile, calculate the first future point at which the stock reaches the safety threshold or zero.

Display:

- predicted run-out day/date
- urgency
- suggested quantity to purchase
- a compact explanation of why

Example:

> **Milk may run out Saturday morning**  
> Weekend use is usually higher.  
> Recommended: **2 bottles**

#### F. Replenishment alert

When the predicted shortage enters the alert horizon, create a household replenishment request.

Example alert horizon: 24–48 hours before predicted run-out.

Request states:

- `open`
- `claimed`
- `completed`
- `cancelled`

#### G. Claim coordination

All household members can see an open request.

Button:

> **I’ll get it**

The first successful claim assigns the request atomically to one member.

After claim:

> **Dad is getting the milk.**

Other clients must update quickly enough for the demo to show that duplicate purchasing has been prevented.

#### H. Complete / replenish

The assignee can mark the request as purchased and enter quantity, ideally with one tap using the recommended quantity.

Example:

> `[Bought 2 bottles]`

This:

- records the purchase event,
- increases stock,
- closes the replenishment request,
- recalculates the next predicted run-out.

This makes the loop visibly continuous.

---

## 6. Forecast model

### Design goal

Start deterministic, transparent, and testable.

Do **not** add machine learning merely to call the product “AI.” A good deterministic forecast is stronger for this prototype than an opaque model with no useful training data.

### Basic model

For an item `i`, estimate consumption for each future interval:

```text
expected_consumption(i, day)
  = baseline_daily_consumption(i)
  × calendar_multiplier(day)
  × household_presence_factor(i, day)
```

Then simulate forward:

```text
stock[t+1] = max(0, stock[t] - expected_consumption[t])
```

The predicted run-out is the earliest future time `t` where:

```text
stock[t] <= safety_threshold
```

For a more visually satisfying demo, simulate in hourly or half-day steps rather than only whole days.

### Calendar multiplier

Minimum:

```text
weekday = 1.0
weekend = configurable (e.g. 1.5)
```

Optional later:

- holiday multiplier
- school-day / no-school-day mode
- member-away toggle

### Member-weighted model

Preferred internal representation:

```text
expected_daily_consumption
  = Σ(member_consumption_rate × presence × day_type_multiplier)
```

This lets a household model facts such as:

- one member never eats cereal,
- one parent eats breakfast away from home on weekdays,
- everyone eats breakfast at home on weekends.

The first UI may collapse this into simple presets rather than exposing every parameter.

### Recommended purchase quantity

Calculate enough supply to survive a configurable target period plus reserve.

Simple version:

```text
target_stock = expected_consumption(next N days) + safety_reserve
needed = max(0, target_stock - estimated_stock)
packages = ceil(needed / package_size)
```

Default `N` can be 3–7 days depending on item type. For the demo, use values that make “Buy 2 bottles” easy to understand.

### Confidence language

Never say:

> “Milk will run out at 9:12 AM.”

Prefer:

> “Milk is likely to run out Saturday morning.”

This accurately reflects the fact that the model estimates human behavior.

---

## 7. Learning from actual behavior — P1

If time permits, make the model improve without requiring manual tuning.

When a new purchase occurs, compare actual time-to-repurchase with the previous forecast and slowly update the baseline consumption rate using an exponential moving average.

Conceptually:

```text
new_rate = α × observed_rate + (1 - α) × old_rate
```

Keep `α` conservative (for example `0.2–0.3`) so one unusual week does not completely rewrite the household profile.

If implemented, expose this gently:

> “Milk Tomorrow is learning that your family uses more milk on weekends.”

This is optional. A reliable deterministic MVP is more important.

---

## 8. Suggested data model

Names may be adapted to the chosen framework.

### Household

```text
id
name
created_at
```

### Member

```text
id
household_id
display_name
created_at
```

### Item

```text
id
household_id
name
unit
package_size
estimated_stock
safety_threshold
default_purchase_packages
baseline_daily_consumption
weekday_multiplier
weekend_multiplier
last_calculated_at
created_at
updated_at
```

### MemberItemProfile (optional but preferred)

```text
id
member_id
item_id
consumption_rate
weekday_presence
weekend_presence
```

### PurchaseEvent

```text
id
item_id
member_id
quantity
packages
purchased_at
created_at
```

### ReplenishmentRequest

```text
id
item_id
status
predicted_runout_at
recommended_packages
claimed_by_member_id nullable
claimed_at nullable
completed_at nullable
created_at
```

### Notification / Activity (optional persistent table)

```text
id
household_id
member_id nullable
kind
message
created_at
read_at nullable
```

---

## 9. Concurrency requirement

The **claim action must be atomic**.

Two family members may tap “I’ll get it” almost simultaneously. Only one should win.

At the database level, update only when request status is still `open`:

```text
UPDATE replenishment_request
SET status = 'claimed', claimed_by = current_member
WHERE id = request_id AND status = 'open'
```

If zero rows are updated, another member already claimed it. Refresh and show the actual assignee.

This small piece of concurrency correctness is worth implementing because it directly proves the product’s coordination value.

---

## 10. Suggested architecture

Optimize for a public, remotely testable prototype and very short implementation time.

Recommended default:

- **Next.js + TypeScript** — app/UI/server actions or API routes
- **Supabase / Postgres** — database, simple authentication or demo identities, realtime updates
- **Tailwind CSS** or similarly fast UI layer
- **Vercel** — deployment

Equivalent technologies are fine if Codex finds a simpler path. Avoid architectural ceremony that does not improve the demo.

### Realtime

Use Supabase Realtime or a similarly simple mechanism so that two open browser windows representing different family members visibly synchronize:

1. Window A claims milk.
2. Window B immediately changes from “I’ll get it” to “Dad is getting the milk.”

This is a high-value demo moment.

### Notifications

Priority order:

1. **In-app household notifications / activity feed** — required.
2. **Browser Notification API** while app is open — desirable.
3. **PWA Web Push** — optional if implementation is reliable and time allows.
4. Native mobile push — out of scope for hackathon MVP.

Do not let production-grade push infrastructure block the core prototype.

---

## 11. UX structure

The app should feel domestic and friendly, not like warehouse software.

### Home / “Tomorrow” screen

Hero state:

> **Good morning. Here’s what your home may need next.**

Cards sorted by urgency.

Example:

```text
🥛 Milk
Likely to run out tomorrow morning
Weekend use is usually higher

Buy 2 bottles
[ I’ll get it ]
```

Claimed state:

```text
🥛 Milk
Dad is getting it ✓
Expected before Saturday breakfast
```

Safe state:

```text
🥣 Cereal
About 5 days left
No action needed
```

### Item detail

Show enough evidence that the prediction is real:

- current estimated stock
- simple consumption curve / timeline
- weekday vs weekend consumption
- next predicted shortage
- recent purchases

A small visualization is strongly preferred because it makes the simulation legible in a hackathon video.

### Household activity

Example:

```text
07:14  Milk Tomorrow predicted milk shortage
07:16  Dad volunteered to buy 2 bottles
18:42  Dad marked 2 bottles as purchased
18:42  Next predicted shortage: Aug 26
```

This is useful both as UX and as demonstration evidence.

---

## 12. Demo mode

A hackathon judge should not need to wait three real days for milk to disappear.

Implement **Demo / Time Travel mode**.

This may be the most important hackathon-only feature.

Allow the tester to:

- load a fictional five-person household,
- start on Friday with known milk/cereal stock,
- advance simulation time by 6 hours / 1 day,
- watch the forecast change,
- trigger the shortage alert,
- switch between two household members,
- claim the request,
- record purchase,
- see the next forecast move into the future.

The demo must make the entire product loop testable in under two minutes.

Suggested fictional scenario:

```text
Friday 07:00
Household: 5 people
Milk remaining: 1.2 L
Weekday consumption: 0.6 L/day
Weekend consumption: 1.0 L/day
Package size: 1 L

Forecast:
Likely shortage: Saturday morning
Recommendation: buy 2 bottles
```

Exact values can be tuned to produce a visually clear result.

---

## 13. Test requirements

At minimum, add unit tests for the forecasting engine.

Required cases:

1. Constant daily consumption predicts correct run-out.
2. Weekend multiplier moves run-out earlier.
3. Purchase event moves run-out later.
4. Safety threshold triggers before literal zero if configured.
5. Package recommendation rounds upward correctly.
6. Two simultaneous claim attempts cannot both succeed.
7. Recalculation from a timestamp does not double-subtract previously simulated consumption.

The forecast engine should be implemented as pure functions where practical so it can be tested independently from UI/database code.

---

## 14. Privacy / safety / limitations

Document these honestly in README and Devpost submission.

### Privacy

- Collect only household data required for the prototype.
- Do not require precise location.
- Do not expose household membership or consumption data publicly.
- Demo data must be fictional.

### Known limitations

- Forecasts depend on estimated consumption and purchase logging.
- Unexpected guests, travel, spills, recipe use, or unusual weeks can make predictions wrong.
- The MVP does not directly measure physical stock.
- “Claimed” means a person intends to purchase; it cannot guarantee they will remember.

These are not defects to hide. They clarify exactly what the prototype proves.

---

## 15. Explicit non-goals for the hackathon

Do **not** spend MVP time on:

- receipt OCR
- supermarket integrations
- grocery delivery APIs
- price comparison
- barcode scanning unless trivial
- smart-fridge hardware
- computer vision
- voice assistants
- full calendar integrations
- native iOS/Android apps
- complicated gamification
- an LLM chat interface
- production-scale household permissions

Any of these can be future work. The judged artifact should make the prediction-and-coordination loop exceptionally clear.

---

## 16. Implementation order for Codex

### Phase 1 — make the simulation real

1. Initialize project and development tooling.
2. Implement item + consumption model as pure TypeScript functions.
3. Add forecast tests.
4. Implement demo dataset and controllable clock/time-travel.
5. Build one-item milk forecast UI.

**Checkpoint:** advancing Friday → Saturday visibly changes estimated milk stock and forecast.

### Phase 2 — close the coordination loop

6. Add household/member model.
7. Add replenishment requests.
8. Implement atomic claim action.
9. Add realtime synchronization between two sessions/users.
10. Implement “Bought N packages” completion and forecast recalculation.

**Checkpoint:** two browser sessions can demonstrate Dad claiming milk and the second session immediately seeing that it no longer needs to act.

### Phase 3 — make it judgeable

11. Add 3–5 sample items.
12. Add prediction explanation / simple visualization.
13. Add activity history.
14. Add demo reset button.
15. Make responsive/mobile-friendly.
16. Deploy public demo.
17. Add README with setup, architecture, algorithm, limitations, AI-tool disclosure, and hackathon build disclosure.

### Phase 4 — only if time remains

18. Browser notifications.
19. Lightweight model learning from purchase history.
20. Better member-specific consumption profiles.
21. PWA installability / Web Push.

---

## 17. Definition of done

The MVP is done when a remote judge can open the demo and, without reading source code:

- understand that Milk Tomorrow predicts shortages rather than waiting for manual list entry,
- see milk consumption being mathematically simulated,
- see a weekend pattern change the prediction,
- receive/see a “buy milk” replenishment request before stock reaches zero,
- claim the purchase as one household member,
- see another household member immediately learn who is buying it,
- mark the purchase complete,
- see the future shortage move later,
- inspect the repository and understand how the forecast works.

If these work smoothly, stop adding features and polish the demo.

---

## 18. Suggested hackathon demo story

Keep the public demo story small and personal.

Opening:

> **Saturday morning. Five people. Cereal is ready. The milk is gone. Again.**

Then:

> Shared shopping lists only help after someone notices. Milk Tomorrow tries to notice tomorrow’s shortage today.

Demo the forecast.

Then show two family members:

> “Milk will probably run out tomorrow. Buy two bottles.”

One taps:

> **I’ll get it.**

The other screen changes:

> **Dad is getting the milk.**

Finish with the broader implication, without making the prototype sound larger than it is:

> Milk is only the first example. The same idea can work for cereal, eggs, toilet paper, detergent, pet food—anything a household consumes with a rhythm.

Closing line:

> **Milk Tomorrow: the shopping list that starts before you run out.**

---

## 19. Future directions

Only after the hackathon MVP is solid:

- automatic learning of household consumption patterns
- calendar-aware presence estimates
- vacations / guests / school holiday modes
- receipt or barcode input
- retailer / grocery-delivery integrations
- price-aware suggested purchase quantity
- notifications based on a member’s normal commuting route
- multi-household use for caregivers
- predictive “next household needs” feed

The larger opportunity is not merely groceries. Milk Tomorrow can become a lightweight household demand model—but the hackathon prototype should prove the idea with one bottle of milk first.
