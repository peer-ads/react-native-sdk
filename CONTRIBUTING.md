# Contributing to @peerads/react-native

Thank you for your interest in contributing! This document covers everything you need to get started.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to uphold it.

## Reporting Bugs

Before opening an issue, search [existing issues](https://github.com/peerads/peerads-react-native/issues) to avoid duplicates. When filing a bug report please include:

- SDK version (`npm list @peerads/react-native`)
- React Native version and platform (iOS / Android)
- Device / emulator OS version
- Minimal reproduction steps
- Expected vs actual behaviour
- Metro bundler and native build logs if applicable

## Suggesting Features

Open a [GitHub Discussion](https://github.com/peerads/peerads-react-native/discussions) before filing a feature request.

## Development Setup

```bash
git clone https://github.com/peerads/peerads-react-native.git
cd peerads-react-native
npm install
npm run build
npm test
```

To test against a real app, use `npm link` or `yalc`:

```bash
# In SDK directory
yalc publish

# In your RN app
yalc add @peerads/react-native
```

## Pull Request Guidelines

1. **Branch** — create a feature branch from `main`: `git checkout -b feat/your-feature`
2. **Small PRs** — one logical change per PR
3. **Tests** — add or update tests for any changed behaviour
4. **TypeScript** — all new code must be fully typed; no `any` without justification
5. **Lint** — `npm run lint` must pass
6. **Commit style** — follow [Conventional Commits](https://www.conventionalcommits.org/)
7. **Changelog** — add an entry to `CHANGELOG.md` under `[Unreleased]`

## Security

Do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
