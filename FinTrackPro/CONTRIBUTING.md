# Contributing to FinTrack Pro

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to FinTrack Pro. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 📋 Code of Conduct

This project and everyone participating in it is governed by a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to sandeshkadel@example.com.

## 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include device info** (iOS version, Android version, device model, app version)

## 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

## 🔧 Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your PR whenever possible
- Follow the TypeScript and React Native style guides
- Document new code with JSDoc comments
- End all files with a newline

## 🏗 Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- For iOS: macOS, Xcode 15+, CocoaPods
- For Android: Java 17, Android Studio, Android SDK 34

### Local development
```bash
git clone https://github.com/Sandeshkadel/FinTrack.git
cd FinTrack/FinTrackPro
npm install --legacy-peer-deps
npm start
```

### Coding Style

- **TypeScript:** Strict mode, no `any` unless absolutely necessary
- **Components:** Functional components with hooks, no class components
- **Naming:** PascalCase for components, camelCase for utilities, UPPER_SNAKE_CASE for constants
- **Imports:** Use `@/*` path alias for absolute imports
- **Comments:** JSDoc on every exported function/component
- **Formatting:** Prettier with `printWidth: 100, singleQuote: true, trailingComma: 'all'`

### File Structure
- One component per file
- Group related components in `src/components/`
- Group related screens in `src/screens/`
- Pure helpers in `src/utils/`
- Service classes in `src/services/`

### Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
Add expense OCR scanning
Fix calendar dot overflow on small screens
Update dependencies to Expo SDK 51
```

## 📦 Release Process

1. Update version in `package.json` and `app.json`
2. Update `CHANGELOG.md`
3. Create a git tag (`git tag -a v2.1.0 -m "v2.1.0"`)
4. Push the tag (`git push origin v2.1.0`)
5. GitHub Actions builds APK, AAB, and IPA
6. Create a GitHub Release from the tag
7. Upload artifacts to the App Store / Play Store

## 🤝 Community

- Join discussions in [GitHub Discussions](https://github.com/Sandeshkadel/FinTrack/discussions)
- Report bugs via [GitHub Issues](https://github.com/Sandeshkadel/FinTrack/issues)

Thank you for contributing! 💜