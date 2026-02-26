# Changelog

All notable changes to `@peerads/react-native` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-02-24

### Added
- Initial release of `@peerads/react-native`
- `PeerAds.init()` — SDK initialisation with live/test key pairs and environment switching
- `<BannerAd>` component — renders banner ads with `BANNER`, `LARGE_BANNER`, and `MEDIUM_RECTANGLE` sizes
- `<InterstitialAd>` — full-screen interstitial component with event callbacks
- `<RewardedAd>` — rewarded video component with `earned_reward` callback
- `PeerAds.requestAd()` — low-level ad request
- `PeerAds.track()` — track `impression`, `click`, and `install` events
- `PeerAds.reportDau()` — DAU reporting via secret key (server-side)
- Ad network adapters: `react-native-google-mobile-ads`, `react-native-fbads`, `react-native-applovin-max`, `react-native-unity-ads`, `react-native-ironsource` (all optional peer dependencies)
- `AdapterManager` — delegates ad load/show to installed network adapters
- Test mode (`environment: 'test'`) with `pk_test_` keys
- Full TypeScript types (`PeerAdsConfig`, `AdSize`)
- Peer dependencies on React ≥ 18 and React Native ≥ 0.73
