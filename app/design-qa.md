# Milk Tomorrow — Design QA

## Comparison Target

- Source visual truth: `design/home-forecast-reference.png` (`853 × 1844` px)
- Normalized source: `design/home-forecast-reference-393x852.png` (`393 × 852` px)
- Current browser-rendered implementation: `http://localhost:4173/` (frameless responsive route)
- Persisted phone-preview implementation baseline: `design/implementation-home-forecast-393x852.jpg` (`393 × 852` px)
- Earlier persisted side-by-side evidence: `design/design-qa-final-readable.png`
- State: Friday Aug 21, default open request, `89%` shortage risk, `2 bottles`, no family member has claimed it
- Primary capture viewport: `393 × 852` CSS px; screenshot bytes measured `393 × 852` px at browser `devicePixelRatio: 2`
- Additional responsive viewports: `320 × 568` and `1280 × 720` CSS px
- Desktop app surface: `[data-phone-screen]` measured `620 × 720` CSS px at `x = 330`, centered in the `1280px` viewport
- Density normalization: the source was downsampled to `393 × 852`; the current browser capture was already CSS-sized at `393 × 852`. They were composed into one `786 × 852` in-memory comparison canvas and reviewed together at native scale.

The normal route now matches the source's frameless presentation: device bezel, picker, status bar, camera cutout, cursor, and home indicator are absent. The protected simulator remains intact at `?preview=phone` and was verified separately.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] The two recommendation bottles use the same real product asset as the hero rather than the source mock's outline bottle icon.
  - Location: `.bottle-pair` in `src/Prototype.tsx` and `src/prototype.css`.
  - Evidence: the subject and count match, but the implementation is more detailed and slightly optically smaller.
  - Impact: minor icon-style variation only; the recommendation remains immediately readable.
  - Follow-up: make a dedicated outline bottle asset only if exact icon fidelity becomes more important than the consistent product illustration.

- [P3] Keyboard traversal could not be conclusively exercised through the protected touch-emulation shell.
  - Location: optional `?preview=phone` runtime surrounding the app.
  - Evidence: app controls are semantic buttons with labels; the normal responsive route restores pointer cursors and visible focus outlines, but a complete manual hardware-keyboard pass was not performed.
  - Impact: no observed tap or screen-reader semantics issue; this is a residual desktop-preview test gap.
  - Follow-up: run one manual hardware-keyboard pass after deployment.

## Required Fidelity Surfaces

- Fonts and typography: Nunito 400/600/700/800 matches the friendly rounded source treatment. Heading, recommendation, button, and utility-text weights are distinct; no truncation is present. The hero retains the source hierarchy at `393px`, becomes a wider two-line composition on desktop, and stays legible at `320px`.
- Spacing and layout rhythm: the header, hero, risk curve, recommendation, actions, evidence rows, and household strip preserve the source order and grouping. Mobile uses `20px` side padding at `393px`; desktop grows that spacing with `clamp()` while keeping a readable `620px` maximum app width. There is no fake phone margin on the normal route.
- Colors and visual tokens: navy, sky, orange risk, and green action tokens map closely to the source. The final pass added the source's pale-sky page gradient and a restrained green action gradient. Contrast is strong in the default, claimed, completed, snoozed, and risk-derived states.
- Image quality and asset fidelity: generated milk, cloud, and five-member family assets are sharp, correctly cropped, and integrated without halos or placeholders. No emoji, CSS illustration, or fake avatar substitutes are used. Radix icons provide a consistent line-icon family for standard UI actions.
- Copy and content: default copy matches the selected mock. Dynamic headline, color, recommendation, and action copy all derive from the numeric risk band, preventing a low result from retaining a misleading “high” warning. The judged slice consistently presents milk only; cereal is not implied by the current UI.

## Responsiveness and Accessibility

- Mobile web (`393 × 852`): `[data-phone-screen]` fills the viewport at `393 × 852`; the complete default state, including household status, is visible with no device chrome.
- Narrow mobile web (`320 × 568`): `clientWidth 320`, `scrollWidth 320`; content scrolls vertically without horizontal overflow. After the final fix, `Sat morning` ends at `x = 219.35` and `Sat breakfast` starts at `x = 235.42`, leaving a visible gap.
- Desktop web (`1280 × 720`): the app is a centered `620px` column with real browser pointer/focus behavior and pale-sky side space; internal scrolling keeps the full experience accessible.
- Optional phone preview: `?preview=phone` restores the calibrated frame and device picker. The previously verified Pixel 10 evidence remains at `design/pixel-10-responsive.png`.
- Primary and secondary controls are at least `52px` high before device-stage scaling.
- Main regions use headings, figures, named sections, native buttons, alt text, an `aria-live` status, and descriptive dialog labels.
- Focus-visible styles, ordinary web cursors, safe-area environment insets, and reduced-motion handling are present.

## Interaction and Runtime Evidence

- Two-tab claim race: exactly one member wins; the other tab becomes disabled with the winner's name.
- Purchase completion: adding two bottles updates both tabs and moves near-term shortage risk from `89%` to `0%`.
- “We still have some”: records a conservative observation, snoozes for 12 hours, modestly adjusts demand, and avoids inventing a stock amount.
- Time travel: advancing 12 hours ages estimated stock along the deterministic expected path before rerunning the stochastic forecast; `+6 hours`, `+1 day`, and Reset work in the simulation lab.
- Simulation lab, family member picker, activity history, bottom-sheet close, and reset were exercised.
- Responsive-sheet regression check: opening Tomorrow Lab leaves `.device-screen.scrollTop === 0`; the sheet spans `y = 205.58` through `852`, while the hidden keyboard begins below the viewport at `y = 853`.
- A final fresh browser load completed without an error overlay, failed assets, or new Vite-reported client errors; the prior full console check recorded no errors or warnings.
- `npm run check:runtime`: passed; all 28 protected runtime files are intact.

## Comparison History

### Pass 1 — blocked

Evidence: `design/design-qa-pass-1-full.png`.

- [P2] Risk badge was visually detached from the curve and the chart omitted the source's endpoint, origin, guide, and tick cues.
  - Fix: anchored the badge to the simulated endpoint and added the dashed guide, origin dot, time ticks, and outlined endpoint.
- [P2] Hero and recommendation hierarchy were too compact.
  - Fix: top-aligned the hero grid, enlarged the milk asset and headline treatment, and increased the recommendation-icon column and bottles.
- [P2] The first time-travel implementation could show a low numeric result while retaining “high chance,” and it moved “tonight” to 1:00 AM without aging stock.
  - Fix: made headline, color, recommendation, secondary action, and household status derive from risk; changed the snooze to 12 hours; and now ages estimated stock before every future forecast.
- [P2] The decorative cloud produced a 3px horizontal overflow on iPhone.
  - Fix: aligned the asset to `right: 0`; the final screen measures `scrollWidth === clientWidth`.

### Pass 2 — passed

Post-fix evidence: `design/design-qa-final-readable.png` and `design/implementation-home-forecast-393x852.jpg`.

- The earlier chart, hierarchy, state-copy, and overflow findings are visibly resolved.
- The reference and implementation are both `393 × 852` and were reviewed together at native scale.
- No actionable P0/P1/P2 mismatch remains. The source/runtime chrome difference and product-vs-outline mini bottles are acceptable P3 deviations.

### Pass 3 — blocked

Evidence: live in-app Browser captures at `393 × 852` and `320 × 568`.

- [P2] Opening Tomorrow Lab on the frameless route programmatically scrolled the clipped device surface by `271.5px`, moving the sheet above the viewport and exposing the hidden simulated keyboard.
  - Fix: changed the responsive route's outer screen from a scrollable `overflow: hidden` box to `overflow: clip`; `MobileScroll` remains the sole scrolling surface.
- [P2] At `320px`, the `Sat morning` and `Sat breakfast` axis labels overlapped.
  - Fix: added a narrow-screen `10px` axis treatment and a small optical shift for the third label.

### Pass 4 — passed

Post-fix evidence: live in-app Browser captures at `393 × 852`, `320 × 568`, and `1280 × 720`, plus a combined `786 × 852` source/implementation comparison input.

- Tomorrow Lab now opens in place with outer-screen `scrollTop = 0`; the hidden keyboard is fully below the viewport.
- The two narrow-screen axis labels have a `16.07px` gap and no horizontal overflow.
- The default route is frameless at phone width and becomes a centered, readable web-app column on desktop.
- The earlier source hierarchy, typography, palette, generated imagery, copy, and interaction fidelity remain intact.
- No actionable P0/P1/P2 mismatch remains.

## Open Questions

- None blocking. A manual hardware-keyboard pass after deployment remains advisable.

## Implementation Checklist

- [x] Preserve the selected Home Forecast hierarchy and palette.
- [x] Match the chart endpoint cues and risk badge.
- [x] Keep risk language and calls to action consistent with the numeric result.
- [x] Remove horizontal overflow at iPhone and Pixel widths.
- [x] Make the normal route frameless and responsive from `320px` mobile through desktop.
- [x] Preserve the calibrated device simulator behind `?preview=phone`.
- [x] Prevent dialog autofocus from scrolling the outer responsive screen.
- [x] Separate chart-axis labels at the narrow mobile breakpoint.
- [x] Exercise the core coordination and feedback states in two tabs.
- [x] Verify a clean console and protected runtime.

## Follow-up Polish

- Optionally create a dedicated outline-bottle recommendation asset.
- Repeat keyboard traversal in the deployed browser shell.

final result: passed
