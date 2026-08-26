# Submission assets

These event-neutral files are ready for the HackSocial 2026 Devpost gallery, repository previews, and link cards. None contains a previous event name or sponsor mark.

| File | Size | Intended use |
|---|---:|---|
| `milk-tomorrow-thumbnail.png` | 1536 × 1024 (3:2) | Primary submission/gallery thumbnail; crop only after checking the target platform's safe area |
| `milk-tomorrow-social-preview.png` | 1200 × 630 | GitHub repository social preview and link cards |
| `../app/design/implementation-home-forecast-393x852.jpg` | 393 × 852 | Product screenshot showing the initial `89% / 2 bottles` state |
| `../app/design/pixel-10-responsive.png` | Pixel 10 QA capture | Optional responsive-evidence screenshot; not the primary gallery image |

The artwork was generated with OpenAI image generation on August 21, 2026, using the selected Home Forecast screen, milk bottle, and cloud artwork from this repository as visual references. It contains no real person's likeness or personal data.

The thumbnail deliberately mirrors the product's visual language: pale sky blue, deep navy, orange forecast risk, a green accent, and a friendly milk bottle paired with an `89%` probability curve.

## Reuse checklist

- Confirm the actual HackSocial form's aspect ratio, file-size, text-safe-area, and image-count rules before upload; the public Overview only says screenshots are optional but encouraged.
- Prefer the thumbnail for the first gallery slot and the real product screenshot for the second.
- Do not add an event logo or sponsor mark without the organizer's permission and brand guidance.
- Keep `89%` tied to the seeded demo scenario; do not present it as measured household accuracy.
- These assets were created on August 21, inside HackSocial's published August 1–31 event period, while the repository was still framed for another event. Keep that provenance visible in the submission's prior-work disclosure.
- Use this disclosure when required: **“Submission artwork and fictional in-app illustrations were created with OpenAI image generation under human direction; no real person's likeness or personal data was used.”**

## Generation prompt

Built-in OpenAI image generation was used with the selected app screen, milk bottle, and cloud artwork as references:

```text
Use case: ads-marketing
Asset type: HackSocial project-gallery thumbnail and repository social-preview master artwork
Primary request: Create polished, cute, family-friendly key art for the web app "Milk Tomorrow", communicating that it forecasts a milk shortage before the bottle is empty.
Scene/backdrop: Airy pale-sky-blue to white morning gradient with soft clouds.
Subject: One charming glass milk bottle based closely on the app artwork, plus a simple rising orange probability curve ending in an orange "89%" forecast bubble; the mathematics should feel sophisticated but friendly.
Style/medium: Premium soft 3D illustration mixed with clean editorial infographic shapes, matching the app's gentle household-weather tone.
Composition/framing: Landscape 3:2. Bottle on the left third, title and short tagline on the right, rising forecast curve across the lower third. Keep important elements safe for a 1.91:1 crop.
Color palette: Pale sky blue, deep navy, forecast orange, small green accent, and white.
Text (verbatim): "Milk Tomorrow" and "Before the milk is gone."
Constraints: Render both text strings exactly once; render "89%" exactly once; preserve the blue-capped milk bottle and cow motif; no phones, device frame, extra products, people, other words, logos, trademarks, or watermark.
```
