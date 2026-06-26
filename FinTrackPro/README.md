# FinTrack Pro — Mobile App

<div align="center">

**A premium, offline-first personal finance app for iOS and Android.**

Take control of your money with stunning charts, smart insights, OCR receipt scanning, savings goals, and budgets — all stored securely on your device.

[Features](#-features) · [Download](#-download) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Build](#-building-from-source) · [License](#-license)

</div>

---

## 📲 Download

| Platform | Version | Size | Download |
|----------|---------|------|----------|
| 🤖 **Android (APK)** | 2.0.0 | ~65 MB | [**Download Android APK**](https://github.com/Sandeshkadel/FinTrack/releases/latest/download/fintrack-pro.apk) |
| 🤖 **Android (AAB)** | 2.0.0 | ~50 MB | [Download Android AAB](https://github.com/Sandeshkadel/FinTrack/releases/latest/download/fintrack-pro.aab) |
| 🍎 **iOS (IPA)** | 2.0.0 | ~70 MB | [**Download iOS IPA**](https://github.com/Sandeshkadel/FinTrack/releases/latest/download/fintrack-pro.ipa) |

> **Note:** The iOS IPA is unsigned for direct distribution. For App Store installation, see the [Building from Source](#-building-from-source) section. The Android APK works on Android 7.0+ (API 24).

### Installation
- **Android:** Download the APK → enable "Install from unknown sources" → tap to install.
- **iOS:** Download the IPA → use AltStore, Sideloadly, or sign with your Apple Developer account.

---

## ✨ Features

### 💰 Core Finance
- 📊 **Dashboard** — 6 stat cards, 4 animated charts (line, donut, bar, ring), upcoming bills, recent activity
- 💵 **Income Tracking** — multi-image receipts, categories, notes, search
- 💸 **Expense Tracking** — OCR receipt scanning that auto-fills amount, date, and merchant
- 🏆 **Savings Goals** — animated progress rings, custom icons and colors, deadline tracking
- 📈 **Budgets** — weekly / monthly / yearly limits with auto-calculated usage
- 📅 **Calendar** — month grid with income/expense dots, daily drill-down
- 📑 **Reports** — daily / weekly / monthly / yearly summaries + CSV / JSON export
- 💡 **Insights** — AI-powered spending analysis, savings streak, top categories, biggest expenses
- 🔍 **Quick Search** — instant full-text search across all transactions
- 👤 **Profile** — avatar upload, achievements, password change
- ⚙️ **Settings** — light / dark / system theme, 8 currencies, biometrics, notifications

### 🔒 Security & Privacy
- 🏠 **100% Offline** — no servers, no accounts, no tracking
- 🔐 **Local Encryption** — passwords hashed, sensitive data in SecureStore
- 👆 **Biometrics** — Face ID / Touch ID / Fingerprint unlock
- 📦 **On-device Storage** — AsyncStorage + SQLite for image blobs

### 🎨 Design
- ✨ Glass morphism, soft shadows, gradient cards
- 🌈 Smooth 60 FPS animations with Reanimated 3
- 🌗 Light / Dark / System theme
- 📱 Responsive layouts for phones, tablets, foldables, large screens
- ♿ Accessible — WCAG AA contrast ratios

### 🌍 Platform Support
- 🍎 iOS 15.1+ (iPhone, iPad, iPad Pro)
- 🤖 Android 7.0+ (API 24, Nougat and above)
- 📐 Tablets & Foldables (adaptive layouts)
- 💻 Landscape & Portrait orientations

---

## 📸 Screenshots

| Dashboard | Income | Expenses | Goals |
|-----------|--------|----------|-------|
| ![Dashboard](screenshots/dashboard.png) | ![Income](screenshots/income.png) | ![Expenses](screenshots/expenses.png) | ![Goals](screenshots/goals.png) |

| Budgets | Calendar | Reports | Insights |
|---------|----------|---------|----------|
| ![Budgets](screenshots/budgets.png) | ![Calendar](screenshots/calendar.png) | ![Reports](screenshots/reports.png) | ![Insights](screenshots/insights.png) |

| Settings | Profile | Onboarding | Search |
|----------|---------|------------|--------|
| ![Settings](screenshots/settings.png) | ![Profile](screenshots/profile.png) | ![Onboarding](screenshots/onboarding.png) | ![Search](screenshots/search.png) |

> Add screenshots to `screenshots/` directory.

---

## 🛠 Tech Stack

| Layer | Library |
|-------|---------|
| Framework | [Expo SDK 51](https://expo.dev) · React Native 0.74.5 · TypeScript |
| Navigation | React Navigation 6 (Bottom Tabs + Native Stack) |
| State | React Context + useReducer (Redux-style) |
| Storage | AsyncStorage · Expo SQLite · Expo SecureStore |
| Charts | react-native-svg (custom Line / Donut / Bar / Ring) |
| Animations | react-native-reanimated 3 · Gesture Handler |
| Bottom Sheets | @gorhom/bottom-sheet |
| Forms | Custom Input · FormSheet |
| Images | expo-image · expo-image-picker · expo-image-manipulator |
| Auth | expo-local-authentication (Face ID / Touch ID / Fingerprint) |
| Notifications | expo-notifications (local-only) |
| Export | expo-print · expo-sharing · expo-file-system |
| Haptics | expo-haptics |

### Architecture
```
FinTrackPro/
├── App.tsx                       # Root: providers + gate (Splash → Onboarding → Auth → Main)
├── src/
│   ├── components/               # Reusable UI (Card, Button, Input, Charts, ...)
│   ├── screens/                  # 14 screens (Dashboard, Income, Calendar, ...)
│   ├── navigation/               # RootNavigator (bottom tabs + stack)
│   ├── context/                  # AppContext (data), ThemeContext (theme)
│   ├── services/                 # auth, ocr, export, image, notifications
│   ├── storage/                  # AsyncStorage + SecureStore wrappers
│   ├── database/                 # SQLite image blob storage
│   ├── utils/                    # Finance helpers, formatters
│   ├── types/                    # TypeScript interfaces
│   ├── constants/                # Colors, spacing, typography
│   └── assets/                   # icon, splash, adaptive-icon
├── android/                      # Android native (Gradle, manifest, etc.)
├── ios/                          # iOS native (Info.plist, AppDelegate, Podfile, ...)
├── .github/workflows/            # CI/CD: build-android, build-ios, release, ci
└── store-assets/                 # App Store + Play Store screenshots & metadata
```

---

## 🚀 Building from Source

### Prerequisites
- Node.js 18+ and npm/yarn
- For iOS: macOS, Xcode 15+, CocoaPods
- For Android: Java 17, Android Studio, Android SDK 34
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli eas-cli`

### 1. Clone and install
```bash
git clone https://github.com/Sandeshkadel/FinTrack.git
cd FinTrack/FinTrackPro
npm install --legacy-peer-deps
```

### 2. Run in development
```bash
npm start              # Open Expo Dev Tools
npm run android        # Run on Android emulator/device
npm run ios            # Run on iOS simulator/device
```

### 3. Build production apps

#### Android (APK + AAB)
```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to Expo
eas login

# Configure your project ID (first time only)
eas init

# Build APK (for direct distribution)
eas build -p android --profile preview

# Build AAB (for Play Store)
eas build -p android --profile production
```

#### iOS (IPA)
```bash
# Build for App Store
eas build -p ios --profile production

# Build for TestFlight
eas build -p ios --profile preview
```

### 4. Local native builds
```bash
# Generate native projects
npx expo prebuild --clean

# Android (requires Android Studio + SDK)
cd android && ./gradlew assembleRelease

# iOS (requires macOS + Xcode)
cd ios && pod install && open FinTrackPro.xcworkspace
```

---

## 📦 CI/CD

This repo includes GitHub Actions workflows:

| Workflow | Trigger | Output |
|----------|---------|--------|
| `ci.yml` | PR + push | TypeScript check, ESLint |
| `build-android.yml` | PR + push + tag | Android APK + AAB |
| `build-ios.yml` | PR + push + tag | iOS IPA |
| `release.yml` | Tag `v*` | GitHub Release with all artifacts |

Add `EXPO_TOKEN` to your repo secrets (get it from https://expo.dev/accounts/[account]/settings/access-tokens).

---

## 🎨 Brand

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#8b5cf6` | Buttons, links, accents |
| Accent | `#ec4899` | Highlights, charts |
| Success | `#10b981` | Income, positive deltas |
| Dark | `#111827` | Dark mode background |
| Light | `#f3f4f6` | Light mode background |

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the guidelines.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for the full text.

---

## 🔒 Privacy & Terms

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)

---

## 📞 Contact

- **Author:** Sandesh Kadel
- **GitHub:** [@Sandeshkadel](https://github.com/Sandeshkadel)
- **Issues:** [GitHub Issues](https://github.com/Sandeshkadel/FinTrack/issues)

---

## 🌟 Star History

If FinTrack Pro helped you, [⭐ star the repo](https://github.com/Sandeshkadel/FinTrack) to show support!

<div align="center">

Made with 💜 for your financial freedom.

</div>