# Changelog

All notable changes to FinTrack Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-26

### 🎉 Major Release — React Native + Expo Conversion
First production-ready React Native build, replacing the original HTML/JS single-file web app.

### ✨ Added
- **Native iOS + Android apps** built with React Native 0.74.5 + Expo SDK 51
- **Onboarding flow** with 6 animated slides (welcome, analytics, OCR, goals, security, ready)
- **Auth system** — sign up / sign in / biometric unlock (Face ID, Touch ID, fingerprint)
- **Dashboard** — financial health score (0-100), 6 quick stat cards, 4 animated charts sharing a `chartRange` filter (Week / Month / 6M / Year / All), upcoming bills, recent activity
- **Income & Expenses** — full CRUD with multi-image uploads (up to 8 images per record), category chips, search
- **OCR receipt scanning** — auto-extract amount, date, merchant from receipt photos
- **Goals** — savings goals with custom icons / colors, animated progress rings, deadlines
- **Budgets** — weekly / monthly / yearly limits with live usage bars
- **Calendar** — month grid with day dots, drill-down for daily events, month summary tiles
- **Reports** — daily / weekly / monthly / yearly breakdowns, category donut, top-category insights, CSV + JSON export
- **Insights** — 7-card AI-powered analysis (spending trend, top category, biggest expense, goal progress, budget health, savings streak, income trend)
- **Quick Search** — instant full-text search across transactions with type filters
- **Profile** — avatar upload, name edit, password change, achievements grid, member-since date
- **Settings** — light / dark / system theme, 8 currencies (USD, EUR, GBP, JPY, INR, AUD, CAD, CNY), biometrics toggle, test notifications, data export, account delete
- **Bottom sheet forms** via @gorhom/bottom-sheet for all CRUD operations
- **Custom SVG charts** (Line, Donut, Bar, ProgressRing) with gradient fills
- **Toast notifications** — slide-in alerts at the top
- **Image lightbox viewer** — pinch-to-zoom, double-tap, swipe between images
- **Animations** — Reanimated 3 with shared element transitions
- **Glass morphism** — BlurView tab bar, soft shadows, gradient backgrounds
- **Empty states** — friendly illustrations and CTAs for every screen

### 🔒 Security
- Passwords hashed with a custom SHA-based algorithm
- Sensitive preferences stored in expo-secure-store
- Optional biometric unlock (Face ID / Touch ID / Fingerprint)
- 30-day session expiry

### 🌗 Accessibility
- Light / Dark / System themes with smooth transitions
- WCAG AA contrast ratios
- High-contrast labels and icons
- Screen reader support

### 🏗️ Architecture
- Hybrid storage: AsyncStorage for structured data, SQLite for image blobs
- Custom React Context + useReducer state management
- Strict TypeScript with `@/*` path aliases
- Modular service layer (auth, ocr, export, image, notifications)

### 📱 Platform Support
- iOS 15.1+ (iPhone, iPad, iPad Pro)
- Android 7.0+ (API 24, Nougat and above)
- Tablets and foldables (adaptive layouts)
- Landscape and portrait orientations

### 📚 Documentation
- Comprehensive README with iOS + Android download links
- Inline JSDoc comments throughout the codebase
- CI/CD workflows for automated builds
- Privacy policy and terms of service

## [1.x.x] - Original Web App
HTML/JS/CSS single-file application — see the parent repo for history.