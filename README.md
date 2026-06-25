# FinTrack Pro Ultimate

> **Premium single-file finance app.** Income, expenses, savings goals, budgets, calendar with receipts, on-device OCR receipt scanner, quick search, and a beautiful dashboard — all running in your browser with **zero servers, zero accounts, zero data leaving your device**.

<p align="center">
  <img src="https://img.shields.io/badge/HTML-5-orange?logo=html5" alt="HTML5" />
  <img src="https://img.shields.io/badge/JS-Vanilla-f7df1e?logo=javascript" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Storage-localStorage-2ea44f" alt="localStorage" />
  <img src="https://img.shields.io/badge/Offline-100%25-blueviolet" alt="Offline" />
  <img src="https://img.shields.io/badge/Session-30--day%20expiry-ff69b4" alt="30-day session" />
  <img src="https://img.shields.io/badge/OCR-On--device-success" alt="On-device OCR" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT" />
</p>

---

## ✨ What's inside

| Module | Highlights |
| --- | --- |
| **Dashboard** | Animated stat cards, 4 range-aware Chart.js charts (income/expense, category donut, budget bar, savings line) |
| **Income** | Add sources, categories, dates, **multiple receipt images per record** |
| **Expenses** | Receipt scanner with **on-device OCR** (Tesseract.js) + noise-removal pipeline (grayscale → blur → contrast) |
| **Goals** | Progress bars, deadlines, motivation images — gallery previews |
| **Budgets** | Per-category monthly caps, live "used vs limit" bars |
| **Calendar** | Per-day badge dots, **image gallery on every day with records**, click-to-detail side panel |
| **Reports** | Monthly / yearly breakdowns, top categories, export-ready |
| **Insights** | Auto-generated tips based on your data |
| **Quick Search** | `Ctrl + K` / `⌘ + K` overlay with text + amount-range + date-range + type filters |
| **Settings** | Currency, theme (light/dark), session info, data export/import |

---

## 🎨 Theme

The app is built around a purple-to-pink gradient. The full color palette is in [`prompt.md`](./prompt.md).

| Token | Hex | Use |
| --- | --- | --- |
| `--primary` | `#8b5cf6` | Brand purple — buttons, links, charts |
| `--primary-dark` | `#7c3aed` | Hover states |
| `--primary-light` | `#a78bfa` | Soft accents |
| `--secondary` | `#ec4899` | Pink highlights, gradients |
| `--success` | `#10b981` | Income, positive deltas |
| `--danger` | `#ef4444` | Expenses, overspend |
| `--warning` | `#f59e0b` | Budgets near limit |
| `--gray-50` | `#f9fafb` | Light backgrounds |

Dark mode swaps to deep purple-black `#0f0a1f` and glassy cards.

---

## 🚀 Run it locally

You only need a static file server. Pick one:

```bash
# Python (any 3.x)
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S 127.0.0.1:8000
```

Then open <http://127.0.0.1:8000/> in your browser. **No `npm install`, no build step, no backend.**

### Or just open the file

`index.html` works as a `file://` URL too — but Tesseract.js (the receipt scanner) and a few other CDN bits behave more reliably when served over HTTP. Prefer the local server.

---

## 📁 What's in this repo

```
.
├── index.html        # the entire app — HTML, CSS, JS, Chart.js config, OCR
├── refrence.html     # design reference for the 6-step onboarding intro
├── README.md         # you are here
└── prompt.md         # product brief, color palette, logo + favicon prompts
```

That's it. One self-contained HTML file. Move it, host it on GitHub Pages, ship it on a USB stick — it goes where it goes.

---

## 🔒 Privacy

Everything is stored in **`localStorage`** on your device. There is no backend, no telemetry, no analytics, no account.

| Key | Purpose | Cleared when |
| --- | --- | --- |
| `fintrack_user` | Logged-in user profile | You log out, or session expires |
| `fintrack_session_expiry` | 30-day session timestamp | You log out, or expiry passes |
| `fintrack_incomes` | Income records + images | You delete a record, or wipe data |
| `fintrack_expenses` | Expense records + images | You delete a record, or wipe data |
| `fintrack_goals` | Goals + images | You delete a goal, or wipe data |
| `fintrack_budgets` | Budget limits | You delete a budget, or wipe data |
| `fintrack_transactions` | Running transaction log | Settings → Clear data |
| `fintrack_notifications` | In-app notification center | Auto-pruned past 20 |
| `fintrack_theme` | `light` / `dark` | Settings → Theme |
| `fintrack_onboarded` | Skip the 6-step intro on next visit | Set on first launch |

To export your data, use **Settings → Export JSON**. To wipe it, **Settings → Clear all data**.

### 30-day session expiry

When you log in or sign up, the app writes `fintrack_session_expiry = Date.now() + 30 days`. On every page load we check that timestamp — if it's past, the session is cleared and you land on the login screen.

To force-expire for testing:

```js
localStorage.setItem('fintrack_session_expiry', String(Date.now() - 1000));
location.reload();
```

---

## 🖼️ Multi-image on every record

Income, expenses, and goals each support **up to 8 attached images** — perfect for stapling multiple receipts to one expense, or showing the before/after on a savings goal.

- Pick files via the file input (or drag-and-drop where supported).
- Each image is auto-compressed to ~500 KB on-device.
- Tap any thumb to open the lightbox. The "+N" badge means there are more.
- The calendar shows the first image with a count badge for days with multiple.

---

## 🔍 Quick Search

Press `Ctrl + K` (Windows / Linux) or `⌘ + K` (macOS), or click the search pill in the top bar. The overlay lets you:

- Type any text (matched against source, description, category, notes, tags)
- Filter by **type** (All / Income / Expenses / Goals / Budgets)
- Filter by **amount range** (min / max)
- Filter by **date range** (from / to)
- Click any result to jump straight to the record and open the edit modal

---

## 📸 On-device OCR (receipt scanner)

Open an expense → **Scan Receipt (OCR)**. The app:

1. Compresses the image (capped ~500 KB)
2. Runs a **noise-removal pipeline**: grayscale → box-blur (kills paper grain) → contrast + brightness bump
3. Lazy-loads **Tesseract.js** from a CDN (~2 MB, downloaded once)
4. Recognizes the text
5. Regex-parses `total`, `date`, and `merchant` and pre-fills the form

The cleaned image replaces the upload so you can see exactly what was OCRed. All processing is local — the photo never leaves your browser.

---

## 🛠️ Tech

- **HTML / CSS / Vanilla JS** — no build step, no framework
- **Chart.js 4.4** — loaded from CDN for the 4 dashboard charts
- **Font Awesome 6.5** — icons
- **Tesseract.js 5** — lazy-loaded CDN, only when you tap "Scan Receipt"
- **localStorage** — single source of truth, persisted across reloads
- **Canvas API** — image compression + noise removal

---

## 🧭 Roadmap & notes

- Settings → Export JSON / Import JSON for backups
- 30-day session expiry is **sliding**: every reload extends the expiry by 30 days as long as the session is still valid
- Receipt scanner is the only feature that touches the network (Tesseract.js CDN, ~2 MB, lazy-loaded once)

---

## 📜 License

MIT — do whatever you want, attribution appreciated.

<p align="center">
  <sub>Built with 🟣 by Sandesh Kadel</sub>
</p>
