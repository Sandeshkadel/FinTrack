# FinTrack Pro — Mobile App

<div align="center">

**A premium, offline-first personal finance app for iOS and Android.**

Take control of your money with stunning charts, smart insights, OCR receipt scanning, savings goals, and budgets — all stored securely on your device.

[Features](#-features) · [Download](#-download) · [iOS Install Guide](#-ios-install-guide-altstore--sideloadly) · [Android Install Guide](#-android-install-guide) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Build](#-building-from-source) · [License](#-license)

</div>

---

## 📲 Download

| Platform | Version | Size | Download |
|----------|---------|------|----------|
| 🤖 **Android (APK)** | 2.0.0 | ~65 MB | [**Download Android APK**](https://github.com/Sandeshkadel/FinTrack/releases/latest/download/fintrack-pro.apk) |
| 🤖 **Android (AAB)** | 2.0.0 | ~50 MB | [Download Android AAB](https://github.com/Sandeshkadel/FinTrack/releases/latest/download/fintrack-pro.aab) |
| 🍎 **iOS (IPA)** | 2.0.0 | ~70 MB | [**Build IPA locally →**](https://github.com/Sandeshkadel/FinTrack#-building-from-source) |

> **Platform requirements:** Android 7.0+ (API 24) · iOS 15.1+
>
> **Build status:** The Android APK and AAB are produced automatically by GitHub Actions on every `v*` tag and attached to the [Releases page](https://github.com/Sandeshkadel/FinTrack/releases). The iOS IPA is **not** pre-built (Apple requires macOS + Xcode) — see the [iOS Install Guide](#-ios-install-guide-altstore--sideloadly) below. You can build the IPA yourself from source on macOS in ~10 minutes, then sideload it via AltStore or Sideloadly with a free Apple ID.

---

## 🍎 iOS Install Guide (AltStore & Sideloadly)

> **Heads-up:** Apple does not allow permanent free installation of iOS apps outside the App Store. The methods below use your free Apple ID to sign the IPA locally — they work, but with limitations.
>
> **No prebuilt IPA in releases:** Because Apple requires macOS + Xcode to build iOS apps, this repo does **not** ship a pre-built `.ipa` in the GitHub Release. You will build it yourself on a Mac in ~10 minutes (commands below) OR use the web app / Android version. The Android APK is prebuilt and attached to every release.

### Build the IPA yourself (macOS only, ~10 minutes)

```bash
git clone https://github.com/Sandeshkadel/FinTrack.git
cd FinTrack/FinTrackPro
npm install --legacy-peer-deps
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
eas build -p ios --profile preview --local --output ./build/fintrack-pro.ipa
# OR if you don't have an Expo account, use xcodebuild directly:
# cd ios && xcodebuild -workspace FinTrackPro.xcworkspace -scheme FinTrackPro \
#   -configuration Release -destination 'generic/platform=iOS' \
#   -archivePath build/FinTrackPro.xcarchive CODE_SIGNING_ALLOWED=NO archive
```

The output is `FinTrackPro/build/fintrack-pro.ipa`. Use it with the AltStore or Sideloadly methods below.

### Limitations of free Apple ID sideloading

| Limit | Detail |
|-------|--------|
| **7-day expiry** | The app stops launching after 7 days unless refreshed |
| **3-app limit** | Max 3 sideloaded apps per device (apps in active use, not total installed) |
| **Computer required** | AltServer must run in background to auto-refresh |
| **No push notifications** | Apple blocks `aps-environment` for free provisioning (local notifications still work) |
| **No iCloud sync** | Keychain sharing & iCloud features are disabled |
| **Reinstall on new device** | Must re-sign with your Apple ID |

For a permanent install without limits, you need a **paid Apple Developer Account ($99/year)** and submit to the App Store.

---

### Method 1: AltStore (recommended — auto-refresh)

**Best for:** users who want the app to refresh itself in the background and forget about re-signing.

#### Requirements
- iPhone / iPad running iOS 15.1 or later
- A computer (Windows, macOS, or Linux) on the same Wi-Fi network as your iPhone
- A free Apple ID (no paid developer account needed)
- USB cable (or stay on the same Wi-Fi)

#### Step 1 — Install AltServer on your computer

| Platform | Download |
|----------|----------|
| **Windows** | [altstore.io](https://altstore.io) → download `.exe` installer |
| **macOS** | [altstore.io](https://altstore.io) → download from Mac App Store (recommended) or direct `.dmg` |
| **Linux** | Not officially supported — use Method 2 (Sideloadly) instead |

Run the installer. On Windows, AltServer lives in your system tray. On macOS, it lives in the menu bar.

#### Step 2 — Install AltStore on your iPhone

1. **Open AltServer** on your computer.
2. **Connect iPhone to computer via USB** (and tap "Trust" on the phone when prompted).
3. **Pair AltServer with your Apple ID:**
   - Windows: click the AltServer tray icon → **"Install AltStore"** → select your iPhone.
   - macOS: click the AltServer menu bar icon → **"Install AltStore"** → select your iPhone.
   - When prompted, sign in with your **Apple ID email + app-specific password** (see Step 3 below for app-specific password).
4. AltStore will install on your iPhone. Trust the developer profile (see Step 4 below).

#### Step 3 — Generate an app-specific password (Apple ID)

AltStore needs an app-specific password to sign IPAs with your Apple ID.

1. Go to [appleid.apple.com](https://appleid.apple.com) → sign in.
2. **App-Specific Passwords** section → click **"Generate Password"**.
3. Label it `AltStore` → copy the generated 16-character password (format: `abcd-efgh-ijkl-mnop`).
4. Paste this into AltStore when it asks for your Apple ID password.

> **Tip:** You can revoke this password later from the same page if needed.

#### Step 4 — Trust the developer profile (first launch)

When you first open AltStore on iPhone:

1. Open iPhone **Settings** app.
2. Go to **General → VPN & Device Management**.
3. Tap your **Apple ID** under "Developer App".
4. Tap **"Trust [your email]"** → confirm.

#### Step 5 — Download FinTrack Pro IPA

Download from the [Download](#-download) table above, or directly:
```
https://github.com/Sandeshkadel/FinTrack/releases/latest/download/fintrack-pro.ipa
```

#### Step 6 — Install FinTrack Pro via AltStore

1. **Open AltStore** on your iPhone.
2. Tap the **"+"** button in the **My Apps** tab.
3. Browse to the downloaded `fintrack-pro.ipa` file (Files app → Downloads).
4. Tap it → AltStore installs and signs it with your Apple ID.
5. Wait for the install to complete (1–2 minutes).

#### Step 7 — Launch & trust

1. Open **Settings → General → VPN & Device Management** again.
2. Trust the new **"FinTrack Pro"** developer profile.
3. Launch FinTrack Pro from your home screen.

#### Step 8 — Enable auto-refresh (optional but recommended)

1. Open **AltStore** on iPhone.
2. Go to **Settings** tab.
3. Enable **"Background Refresh"**.
4. Keep AltServer running on your computer (or use AltServer for wireless refresh).
5. The app will now refresh itself every 7 days before it expires.

---

### Method 2: Sideloadly (Windows / macOS / Linux — no background app needed)

**Best for:** Linux users, or anyone who wants a one-click install without installing AltServer.

#### Requirements
- iPhone / iPad running iOS 15.1 or later
- Windows, macOS, or Linux computer
- Free Apple ID
- USB cable

#### Step 1 — Install Sideloadly

Download from [sideloadly.io](https://sideloadly.io) — choose your platform.

#### Step 2 — Download FinTrack Pro IPA

Download from the [Download](#-download) table above.

#### Step 3 — Install

1. Open **Sideloadly**.
2. Connect iPhone via USB.
3. Drag `fintrack-pro.ipa` into the IPA field.
4. Enter your **Apple ID email**.
5. Click **"Start"** → enter your **app-specific password** (same one you generated for AltStore, or generate a new one).
6. Wait 1–2 minutes for installation.

#### Step 4 — Trust the developer profile

1. iPhone **Settings → General → VPN & Device Management**.
2. Trust the **"FinTrack Pro"** developer profile.

#### Step 5 — Refresh every 7 days

Sideloadly does NOT auto-refresh. To keep using the app past 7 days:

1. Reconnect iPhone.
2. Open Sideloadly → drag `fintrack-pro.ipa` back in.
3. Click **"Start"** again — it will re-sign over the existing install.

You can do this from anywhere with your computer — settings and data are preserved.

---

### Troubleshooting

#### "Unable to install" or "Verification failed"
- Make sure you **trusted the developer profile** in Settings → VPN & Device Management.
- Reboot your iPhone and try again.
- Check that the IPA downloaded fully (file size should be ~70 MB).

#### "Apple ID not supported" or "Verification failed: A valid provisioning profile could not be found"
- You may need to **enable Two-Factor Authentication** on your Apple ID (required for sideloading).
- Regenerate your app-specific password and try again.

#### App icon is grey / app won't open
- The 7-day signing window expired. Re-install with Sideloadly or wait for AltStore's background refresh.

#### Push notifications don't work
- This is normal for sideloaded apps. **Local notifications** (budget alerts, savings reminders) work — only remote/APNS push is blocked.

#### "Maximum number of apps for free development profiles reached"
- Free Apple ID allows **3 active sideloaded apps**. Delete one before installing another.

---

## 🤖 Android Install Guide

#### From APK (sideloaded)

1. Download `fintrack-pro.apk` from the [Download](#-download) table.
2. On your Android device, open **Settings → Security → Install unknown apps**.
3. Allow your browser / Files app to install APKs.
4. Open the downloaded APK → tap **Install**.
5. Launch FinTrack Pro from your home screen.

Works on Android 7.0+ (API 24). No expiration, no refresh needed.

#### From Play Store (after store approval)

The AAB (Android App Bundle) is the upload format Google Play requires. Once you have a Google Play Developer account ($25 one-time), upload `fintrack-pro.aab` to the Play Console.

---

### Quick comparison

| Method | Cost | Permanent? | Auto-refresh? | Computer needed? |
|--------|------|-----------|---------------|------------------|
| **Android APK sideload** | Free | ✅ Yes | N/A | Only for initial install |
| **AltStore + free Apple ID** | Free | ❌ 7-day refresh | ✅ Yes (background) | Yes (AltServer runs on it) |
| **Sideloadly + free Apple ID** | Free | ❌ 7-day refresh | ❌ Manual | Yes (every 7 days) |
| **TestFlight + paid dev** | $99/year | ✅ 1 year | ✅ Yes | No |
| **App Store + paid dev** | $99/year | ✅ Forever | ✅ Yes | No |

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