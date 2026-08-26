# Milk Tomorrow — Optional Demo Video Master

> Optional HackSocial 2026 promotional/demo asset. As checked on August 26, the official Overview and Rule 3.5 do not state that a video is mandatory; the working live demo, source, screenshots, and written submission do not depend on producing it.

## Goal and runtime

- Master runtime: **2:50**
- Intended fit: events with a verified limit of at least **3:00**
- Story: problem → simple forecast → coordinated action → completed purchase → mathematical reveal → honest correction → build evidence and limitation
- Evidence covered: the problem, the working product, its most important technical feature, provenance, and current limitations
- Tone: cute and calm on the surface, technically rigorous underneath

The ten-second buffer is intentional. It protects a three-minute export from rounding, title-card timing, and platform playback differences. Before production, verify the actual HackSocial form and any organizer update for duration, host, visibility, captions, AI-media policy, and licensing rules. If no video is required and the public demo is sufficient, leave this file as a future asset.

## Production decisions

| Element | Decision |
|---|---|
| Frame | 1920 × 1080, 16:9, 30 fps |
| Product capture | Record the public responsive web app. Show the centered desktop layout briefly, then use a mobile-width crop for the main flow. |
| Narration | Planned English narration generated locally with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), voice `af_heart`; replace it if the target platform requires another approach. |
| Voice license | Re-check the model, voice, and hosting license immediately before publishing. Do not use a voice whose publication rights are unclear. |
| Captions | Burned-in English captions matching the narration, plus an `.srt` sidecar for the video host |
| Background music | Optional rights-holder-provided WAV of [“なんでなんでなんでなんで”](https://open.spotify.com/intl-ja/track/1FogdwEZrwr1timrqMh681); use only when the event and video host permit it. |
| Music credit | **Music: “なんでなんでなんでなんで” — © ぐらまらすふぁん／使用許諾済み** |
| Music mix | Let the opening and closing breathe; duck the track beneath narration and fade out naturally by 2:50. Do not loop it. |
| Source WAV | Keep it as a local render input. Do not commit the 35 MB master to the public repository. |

## Recording setup

1. Use the public URL: `https://yo4e.github.io/Milk-Tomorrow/`.
2. Reset the demo to Friday morning before recording.
3. Prepare two same-browser windows in advance. Keep Aki selected in one and Ken selected in the other.
4. Close Tomorrow Lab in both windows before the coordination shot.
5. Keep both windows on the same origin so the credential-free tab synchronization is visible.
6. Turn off desktop notifications, hide bookmarks and unrelated tabs, and keep browser zoom at 100%.
7. Record the product interaction first. Record code and test evidence as separate, tightly cropped inserts.
8. Use only repository artwork and media whose permission covers the event and video host; do not add unrelated stock footage.

## Shot-by-shot scenario

### 0:00–0:12 — The problem and hook

**Picture**

- Begin on the Milk Tomorrow thumbnail with the music briefly exposed.
- Display: `Shopping lists start too late.`
- Cut to the working app no later than 0:06.

**Narration**

> Household shopping lists usually start too late—after someone finds an empty shelf. Milk Tomorrow starts earlier, before the milk is gone.

**Caption emphasis**

`Before the milk is gone.`

### 0:12–0:35 — The simple surface

**Picture**

- Show the default responsive page in a desktop browser for two or three seconds.
- Move to the mobile-width view.
- Hold long enough to read `89%`, `Pick up 2 bottles`, `I’ll get it`, and `We still have some`.

**Narration**

> This calm, mobile-first web app tells the Sakura family what matters: an eighty-nine percent chance of running short, and two bottles to pick up before breakfast. It works on both phones and desktop browsers.

**Caption emphasis**

`89% risk · 2 bottles · one friendly decision`

### 0:35–1:10 — Coordination proof

**Picture**

- Put the prepared Aki and Ken windows side by side.
- In Aki's window, tap `I’ll get it` once.
- Let both windows visibly update.
- Point out that Ken sees Aki's name and that Ken's action is disabled.
- Briefly show the shared household activity entry if it fits without rushing.

**Narration**

> Aki and Ken now have the credential-free demo open in two tabs. Aki volunteers with one tap. Both views update immediately. Ken sees Aki's name and cannot claim the same trip. A browser lock allows only the first open request transition to win.

**Caption emphasis**

`One request · one claimant · both tabs updated`

### 1:10–1:28 — Close the loop

**Picture**

- In Aki's window, tap `Bought 2 bottles`.
- Show both windows update.
- Hold on the completed state and the `0%` forecast.

**Narration**

> When Aki records two bottles purchased, stock increases by two one-liter packages. The same forecast reruns, and the near-term shortage risk falls from eighty-nine percent to zero.

**Caption emphasis**

`Purchase recorded · forecast rerun · 0% near-term risk`

### 1:28–1:58 — The mathematical reveal

**Picture**

- Tap `Run the demo again` so the reset is visible.
- Open `See the 1,000 simulated futures`.
- Show `89%`, `+7 pts`, `2 bottles`, and the 340 ml definition.
- Use a subtle highlight around each value; do not scroll source code during this explanation.

**Narration**

> Resetting the reproducible scenario reveals the model underneath. One thousand seeded Monte Carlo futures sample who drinks milk, when they drink it, and how much. The result is eighty-nine percent risk, seven extra weekend points, and a ninetieth-percentile plan of two bottles. Running short means falling below a three-hundred-forty-milliliter safety reserve—not pretending we know the exact moment the bottle is empty.

**Caption emphasis**

`1,000 futures · +7 weekend points · 340 ml reserve`

### 1:58–2:18 — Honest feedback

**Picture**

- Close Tomorrow Lab.
- Tap `We still have some`.
- Show the 12-hour pause, then tap `Move to tonight`.
- Hold on the reopened `90%` forecast and `2 bottles` recommendation.
- Do not reuse the original `+7 pts` overlay here; after time advances, the live weekend effect is `+5 pts`.

**Narration**

> Forecasts can be wrong. If the family says, “We still have some,” Milk Tomorrow records only that fact, makes a bounded adjustment, and pauses alerts for twelve hours. Moving to tonight ages estimated stock and reruns the model. The alert reopens only because the shortage risk still remains.

**Caption emphasis**

`A coarse observation never becomes a fake measurement.`

### 2:18–2:40 — What the prototype proves and what remains

**Picture**

- Show a readable crop of `app/src/domain/forecast.ts` for no more than four seconds.
- Cut to the final `npm test` result showing all eleven domain tests passing.
- Overlay the limitation rather than hiding it.

**Narration**

> The current prototype combines a React interface, a TypeScript forecast engine, a coordination state machine, generated visuals, and eleven deterministic domain tests. The public demo needs no account or API key. Its shared state is deliberately limited to tabs in one browser. Server-backed, cross-device households are the next step.

**Caption emphasis**

`Working prototype · 11 deterministic tests · no credentials`

### 2:40–2:50 — Close and credits

**Picture**

- Return to the app or thumbnail.
- Display the tagline and the public demo URL.
- Include compact voice, music, and AI-assistance credits.

**Narration**

> Milk Tomorrow brings serious forecasting to one friendly household decision. The shopping list writes itself—before the milk is gone.

**End card**

```text
Milk Tomorrow
The shopping list that writes itself—before the milk is gone.
yo4e.github.io/Milk-Tomorrow/

Created and directed by 山田佳江
Voice: Kokoro-82M / af_heart / Apache-2.0
Music: “なんでなんでなんでなんで” — © ぐらまらすふぁん／使用許諾済み
AI-assisted development and generated visuals: OpenAI Codex and OpenAI image generation
```

## Audio plan

- Generate one short `af_heart` preview before rendering the complete narration.
- Check the pronunciations of `Milk Tomorrow`, `Monte Carlo`, `Aki`, `Ken`, `Sakura`, and `milliliter`.
- Keep narration consistently in front of the music. Start with roughly 18–22 dB of music reduction beneath speech, then adjust by ear.
- Let the music rise gently during the first two seconds and the final end card.
- Apply a short fade-in and a natural fade-out ending at 2:50.
- Do not change narration speed merely to force an overlong edit under three minutes; shorten pauses or revise copy first.

## Accuracy guardrails

- The initial deterministic result is `89%`, `2 bottles`, and `+7` weekend points.
- Completing the two-bottle purchase moves the near-term result to `0%`.
- After `We still have some` and `Move to tonight`, the deterministic result is `90%`, `2 bottles`, and `+5` weekend points.
- Never describe same-browser tab synchronization as production cross-device household synchronization.
- Never imply that the model observes the refrigerator or knows the exact amount of milk remaining.
- Keep the 340 ml safety-reserve definition visible when explaining “running short.”
- Do not say the full prototype was built during a later event. If an event requires a build-period statement, replace the provenance line with the exact eligible-period commits documented for that event.

## Shorter cuts

Use these only after checking the target limit:

- **90 seconds:** problem (0:00–0:08) → forecast (0:08–0:22) → claim/purchase (0:22–0:52) → Tomorrow Lab (0:52–1:12) → limitation and close (1:12–1:30). Omit the “We still have some” branch.
- **60 seconds:** problem (0:00–0:06) → `89% / 2 bottles` (0:06–0:18) → two-tab claim and `0%` purchase result (0:18–0:40) → 1,000 futures and limitation (0:40–0:53) → tagline (0:53–1:00).

Do not speed narration until it becomes inaccessible. Remove secondary evidence first and link reviewers to the live demo and README.

## Pre-publish review

1. Does the final HackSocial form or submission strategy actually require or benefit from a video?
2. Is the chosen cut inside the verified duration limit after export?
3. Does the story make the simple-interface/serious-mathematics contrast clear?
4. Is the order `forecast → claim → purchase → math → correction` easy to follow at normal narration speed?
5. Does the same-browser limitation remain explicit?
6. Does the provenance statement match HackSocial's eligible-period interpretation and the Git history?
7. Are captions, voice, music, generated-media, and end-card credits allowed and complete?
