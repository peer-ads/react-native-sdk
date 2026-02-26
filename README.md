# @peerads/react-native

[![npm version](https://img.shields.io/npm/v/@peerads/react-native)](https://www.npmjs.com/package/@peerads/react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

React Native SDK for [PeerAds](https://peerads.io) — unified ad mediation + peer cross-promotion for iOS and Android apps.

## Features

- **Peer network** — cross-promote with same-tier apps at zero cost (90 % of slots by default)
- **Paid campaigns** — CPM-bid waterfall fills remaining slots
- **Self network** — falls back to Google Mobile Ads, Meta, AppLovin MAX, Unity Ads, or IronSource
- **Drop-in components** — `<BannerAd>`, `<InterstitialAd>`, `<RewardedAd>`
- **Test mode** — isolated sandbox via `pk_test_` keys

## Requirements

- React Native ≥ 0.73
- React ≥ 18
- iOS 15+ / Android API 21+

## Installation

```bash
npm install @peerads/react-native
# or
yarn add @peerads/react-native
```

Install only the ad-network adapters you need (all are optional):

```bash
npm install react-native-google-mobile-ads   # AdMob
npm install react-native-fbads               # Meta Audience Network
npm install react-native-applovin-max        # AppLovin MAX
npm install react-native-unity-ads           # Unity Ads
npm install react-native-ironsource          # IronSource
```

## Quick Start

```tsx
import { PeerAds } from '@peerads/react-native';

// Initialize once (App.tsx or index.js)
await PeerAds.init({
  apiKey: 'pk_live_YOUR_KEY',
  networks: {
    admob:    { androidAppId: 'ca-app-pub-XXXX~YYYY', iosAppId: 'ca-app-pub-XXXX~ZZZZ' },
    applovin: { sdkKey: 'YOUR_APPLOVIN_KEY' },
  },
});
```

## Ad Formats

### Banner

```tsx
import { BannerAd } from '@peerads/react-native';

<BannerAd
  size="BANNER"                  // 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE'
  onAdLoaded={() => console.log('loaded')}
  onAdFailed={(err) => console.warn(err)}
/>
```

### Interstitial

```tsx
import { InterstitialAd } from '@peerads/react-native';

const interstitial = InterstitialAd.createForAdRequest('ca-app-pub-XXXX/YYYY');

interstitial.addAdEventListener('loaded', () => interstitial.show());
interstitial.addAdEventListener('error', (err) => console.warn(err));

interstitial.load();
```

### Rewarded

```tsx
import { RewardedAd } from '@peerads/react-native';

const rewarded = RewardedAd.createForAdRequest('ca-app-pub-XXXX/YYYY');

rewarded.addAdEventListener('earned_reward', ({ type, amount }) => {
  console.log(`Reward: ${amount} ${type}`);
});
rewarded.addAdEventListener('loaded', () => rewarded.show());

rewarded.load();
```

## Ad Network Adapters

```tsx
await PeerAds.init({
  apiKey: 'pk_live_...',
  networks: {
    admob: {
      androidAppId: 'ca-app-pub-XXXX~YYYY',
      iosAppId:     'ca-app-pub-XXXX~ZZZZ',
    },
    meta: {
      placementId: 'YOUR_FB_PLACEMENT_ID',
    },
    applovin: {
      sdkKey: 'YOUR_APPLOVIN_SDK_KEY',
    },
    unity: {
      androidGameId: 'UNITY_ANDROID_GAME_ID',
      iosGameId:     'UNITY_IOS_GAME_ID',
    },
    ironsource: {
      appKey: 'YOUR_IS_APP_KEY',
    },
  },
});
```

## DAU Reporting

Report from your **server** using the secret key (never include `secretKey` in the app bundle).

```ts
// Server-side only
await PeerAds.reportDau(15000);
```

## Test Mode

```tsx
await PeerAds.init({
  apiKey:     'pk_live_...',
  testApiKey: 'pk_test_...',
  environment: 'test',
});
```

## API Reference

| Export | Type | Description |
|--------|------|-------------|
| `PeerAds` | class | Core SDK — `init()`, `requestAd()`, `track()`, `reportDau()` |
| `BannerAd` | component | Renders a banner ad |
| `InterstitialAd` | class | Full-screen interstitial |
| `RewardedAd` | class | Rewarded video ad |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © PeerAds
