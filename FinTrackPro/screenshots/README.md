# Screenshots

This directory contains app screenshots used for:

1. **README.md** — GitHub repo preview
2. **App Store** (Apple) — iPhone 6.7", 6.5", 5.5", iPad 12.9"
3. **Play Store** (Google) — Phone, Tablet, Foldable

## Required sizes

### iOS (App Store)
- 6.7" (iPhone 15 Pro Max) — 1290 × 2796 px
- 6.5" (iPhone 11 Pro Max) — 1242 × 2688 px
- 5.5" (iPhone 8 Plus) — 1242 × 2208 px
- 12.9" iPad Pro — 2048 × 2732 px

### Android (Play Store)
- Phone — 1080 × 1920 px (or larger, 2:1 aspect ratio)
- 7" Tablet — 1200 × 1920 px
- 10" Tablet — 1920 × 1200 px
- Feature graphic — 1024 × 500 px
- App icon — 512 × 512 px (PNG, 32-bit)

## Recommended captures

| # | Screen | Description |
|---|--------|-------------|
| 1 | Dashboard | Show financial health score, stat cards, charts |
| 2 | Income | List view with categories |
| 3 | Expenses | List view with categories |
| 4 | Goals | Grid view with progress rings |
| 5 | Budgets | Grid view with usage bars |
| 6 | Calendar | Month view with day dots |
| 7 | Reports | Charts and breakdowns |
| 8 | Insights | AI analysis cards |
| 9 | Settings | Theme picker, currency |
| 10 | Profile | Avatar and achievements |

## How to capture screenshots

```bash
# iOS Simulator
xcrun simctl io booted screenshot screenshot.png

# Android Emulator
adb exec-out screencap -p > screenshot.png

# Device (after enabling Developer Mode)
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

Then resize for each required format using a tool like `sips`, `imagemagick`, or Sketch.