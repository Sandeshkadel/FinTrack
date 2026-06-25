# FinTrack Pro Ultimate — Brand & Asset Prompts

This file is the **handoff brief** for whoever (you, a designer, or an AI image generator) is producing the FinTrack Pro logo and favicon. It captures the product story, the exact color palette, and detailed generation prompts that produce consistent results across runs.

---

## 1. Product story (copy this into your generator context)

**FinTrack Pro Ultimate** is a premium, single-file personal-finance app that runs entirely in the browser. No backend, no accounts, no telemetry. The user signs up locally, sets a 30-day session, and gets:

- A dashboard with animated stat cards and four range-aware charts (income vs expense, category donut, budget bar, savings line)
- Modules for **Income**, **Expenses**, **Goals**, and **Budgets** — every record can carry up to 8 images
- A **Calendar** that surfaces every record on its date, with image previews and click-to-detail
- An **on-device OCR receipt scanner** (Tesseract.js) with a noise-removal pipeline
- A **Quick Search** overlay (`Ctrl + K` / `⌘ + K`) that filters income, expenses, goals, and budgets by text, amount range, date range, and type
- Light / dark themes, glassy cards, gradient highlights

**Tone:** modern fintech, premium-but-friendly, gradient-heavy, glassmorphism, subtle motion. The audience is anyone who wants a beautiful local-first tool, not yet-another-cloud-app.

**Positioning line:**
> "Premium personal finance. Zero accounts. Yours forever."

---

## 2. Color palette (use exactly these hex values)

| Token | Hex | Role |
| --- | --- | --- |
| `--primary` | `#8b5cf6` | Brand purple — primary buttons, chart strokes, focus rings |
| `--primary-dark` | `#7c3aed` | Pressed / hover states |
| `--primary-light` | `#a78bfa` | Soft accent fills, pill backgrounds |
| `--secondary` | `#ec4899` | Pink — gradient terminator, "achievement" highlights |
| `--success` | `#10b981` | Income, savings, positive deltas |
| `--success-dark` | `#059669` | Success hover / pressed |
| `--danger` | `#ef4444` | Expenses, overspend alerts |
| `--warning` | `#f59e0b` | Budgets near limit, weekend tint |
| `--info` | `#3b82f6` | Informational badges, links |
| `--gray-50` | `#f9fafb` | Light-mode page background |
| `--gray-100` | `#f3f4f6` | Card rows, subtle borders |
| `--gray-200` | `#e5e7eb` | Divider lines |
| `--gray-400` | `#9ca3af` | Muted text |
| `--gray-600` | `#4b5563` | Body text (light mode) |
| `--gray-900` | `#111827` | Headings (light mode) |
| Dark bg | `#0f0a1f` | Dark mode page background |
| Dark card | `#1f1b2e` | Dark mode card surface |
| Dark text | `#f3f4f6` | Dark mode body text |

**Signature gradient (use this everywhere):**
`linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)` — purple → pink, 135°.

**Soft glass tint (dark mode cards):**
`rgba(139, 92, 246, 0.08)` over `#1f1b2e`.

---

## 3. Logo prompt (main mark)

Use this prompt with Midjourney / DALL·E 3 / Ideogram / Stable Diffusion XL. **Generate at least 4 variations** and pick the one that feels most "fintech premium".

```
Design a modern, premium logo for "FinTrack Pro" — a personal-finance app.

Style: minimalist fintech mark, glassmorphism hint, subtle gradient.
Mark: an upward-trending bar chart with the last bar morphing into a
      rocket/spark, OR a stylized "F" + "P" monogram inside a rounded
      square with a tiny coin or chart spark. Pick whichever feels
      more iconic.
Colors:
  - primary purple  #8b5cf6
  - accent pink     #ec4899
  - success green   #10b981  (used sparingly, for the upward tick)
Background: transparent.
Composition: a single icon mark on a 1024x1024 canvas, with the
             wordmark "FinTrack" set in a clean geometric sans
             (e.g. Inter, Geist, Manrope) directly below, and the
             word "Pro" in a lighter weight underneath in #6b7280.
Mood: confident, modern, premium, light glow. No realistic
      photography, no busy illustrations.
```

### Wordmark rules

- "FinTrack" — geometric sans, weight 700, color `#111827` (or `#f3f4f6` on dark).
- "Pro" — same family, weight 400, color `#8b5cf6`, optionally italic.
- Letter spacing: tight on "FinTrack" (-0.5%), normal on "Pro".
- The icon mark is at least **1.5x the cap-height** of "FinTrack".

### Variations to generate

Ask the generator for **four** so you can A/B them:

1. **Bar-chart + rocket** mark (most "growth" energy)
2. **"FP" monogram** in a rounded-square glass tile
3. **Wallet + spark** mark (literal finance cue)
4. **Coin / stack with a chart spark** (literal fintech)

---

## 4. Favicon prompts (one per surface)

The app uses one favicon at the page level and **section icons** inside the sidebar. For the section icons we already use Font Awesome 6 — what we need is a **dedicated favicon set** for the app's brand surfaces (PWA install, browser tab, OS bookmark).

Generate a **favicon family** in 4 sizes (16, 32, 48, 192 px) from a single source.

### 4.1 Master favicon prompt

```
Create a square favicon for "FinTrack Pro" — a personal-finance app.

Style: ultra-clean, instantly readable at 16x16 px.
Mark: the upward bar-chart + spark from the main logo, simplified
      to a 2-bar-or-3-bar shape with a single corner spark.
Colors: 2-tone only — purple #8b5cf6 on transparent background,
        with the spark in pink #ec4899.
No text. No wordmark. No border ring. No background fill.
```

### 4.2 Per-section favicon prompts (in-app, sidebar / PWA shortcuts)

Each prompt below produces a **monochrome-on-purple** icon — the sidebar background is already purple, so these will read clearly.

```
[Income icon]   a wallet with an upward arrow in #f3f4f6 on #8b5cf6.
                Stroke 2 px. Rounded corners. 256x256.

[Expenses icon] a receipt with a downward arrow in #f3f4f6 on #ec4899.
                Stroke 2 px. Rounded corners. 256x256.

[Goals icon]    a bullseye target in #f3f4f6 on #8b5cf6.
                2 concentric rings + center dot. 256x256.

[Budgets icon]  a pie-chart wedge with a percent sign in #f3f4f6
                on #f59e0b. 256x256.

[Calendar icon] a calendar grid in #f3f4f6 on #8b5cf6, with one
                day-cell highlighted in #ec4899. 256x256.

[Reports icon]  a 3-bar bar-chart in #f3f4f6 on #10b981. 256x256.

[Insights icon] a lightbulb in #f3f4f6 on #a78bfa, with three
                radiating lines. 256x256.

[Settings icon] a gear/cog in #f3f4f6 on #4b5563. 256x256.
```

### 4.3 URLs — replace these placeholders

Drop your generated assets into an `/assets` folder and update the URLs below in `index.html`:

```html
<!-- In <head> -->
<link rel="icon" type="image/png" sizes="32x32"
      href="https://YOUR-DOMAIN-HERE/assets/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16"
      href="https://YOUR-DOMAIN-HERE/assets/favicon-16.png" />
<link rel="apple-touch-icon" sizes="192x192"
      href="https://YOUR-DOMAIN-HERE/assets/favicon-192.png" />
<link rel="manifest" href="https://YOUR-DOMAIN-HERE/assets/manifest.json" />
```

In a `manifest.json` you can also expose the section icons as PWA shortcut icons:

```json
{
  "name": "FinTrack Pro",
  "short_name": "FinTrack",
  "icons": [
    { "src": "https://YOUR-DOMAIN-HERE/assets/favicon-192.png", "sizes": "192x192", "type": "image/png" }
  ],
  "shortcuts": [
    { "name": "Income",   "url": "/#income",   "icons": [{ "src": "https://YOUR-DOMAIN-HERE/assets/icon-income.png",   "sizes": "192x192" }] },
    { "name": "Expenses", "url": "/#expenses", "icons": [{ "src": "https://YOUR-DOMAIN-HERE/assets/icon-expenses.png", "sizes": "192x192" }] },
    { "name": "Goals",    "url": "/#goals",    "icons": [{ "src": "https://YOUR-DOMAIN-HERE/assets/icon-goals.png",    "sizes": "192x192" }] },
    { "name": "Budgets",  "url": "/#budgets",  "icons": [{ "src": "https://YOUR-DOMAIN-HERE/assets/icon-budgets.png",  "sizes": "192x192" }] }
  ]
}
```

> Replace every `YOUR-DOMAIN-HERE` and `assets/icon-*.png` URL with the path where you actually host the files.

---

## 5. Quality checklist (before shipping)

- [ ] Logo reads cleanly at 32 px tall
- [ ] Favicon is unmistakable at 16×16 (no fine detail)
- [ ] Brand mark survives in monochrome (use a `#111827` version for invoices, in-app legal copy, etc.)
- [ ] Colors are **sRGB**, not P3 — older Android WebViews over-saturate P3
- [ ] PNG-8 favicons (not PNG-24) for sub-1 KB file size
- [ ] All section icons share the same stroke weight and corner radius (the prompts above use 2 px stroke + 24 px corner)

---

## 6. What the AI shouldn't do

- ❌ Don't add drop shadows to the master mark — keep it flat
- ❌ Don't introduce a third brand color (e.g. teal) — purple + pink + green accents only
- ❌ Don't use a serif wordmark — geometric sans is non-negotiable
- ❌ Don't put the wordmark inside the icon — the icon must stand alone at favicon size
- ❌ Don't ship the favicon over a colored background tile — transparent only

---

Generated for the FinTrack Pro Ultimate build. Hand off to a designer or paste into your favorite image generator.
