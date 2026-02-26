import { ViewStyle } from 'react-native';
import { AdNetworkAdapter, NetworkAdapterConfig } from './AdNetworkAdapter';

/**
 * Unity Ads adapter using `react-native-unity-ads`.
 * Install: npm install react-native-unity-ads
 * iOS: npx pod-install
 */
export class UnityAdapter implements AdNetworkAdapter {
  private _interstitialReady = false;
  private _rewardedReady = false;
  private gameId = '';
  private interstitialPlacement = 'Interstitial_Android';
  private rewardedPlacement = 'Rewarded_Android';

  get isInterstitialReady() { return this._interstitialReady; }
  get isRewardedReady() { return this._rewardedReady; }

  async initialize(config: NetworkAdapterConfig) {
    this.gameId = config.gameId ?? '';
    this.interstitialPlacement = config.interstitialPlacement ?? 'Interstitial_Android';
    this.rewardedPlacement = config.rewardedPlacement ?? 'Rewarded_Android';

    try {
      const UnityAds = require('react-native-unity-ads').default;
      await new Promise<void>((resolve) => {
        UnityAds.initialize(this.gameId, false, {
          onInitializationComplete: () => resolve(),
          onInitializationFailed: (_e: any, _m: string) => resolve(), // non-fatal
        });
      });
    } catch {
      console.warn('[PeerAds/Unity] react-native-unity-ads not installed');
    }
  }

  getBannerComponent(adUnitId: string, style?: ViewStyle) {
    try {
      const { UnityBannerAd } = require('react-native-unity-ads');
      const React = require('react');
      return () => React.createElement(UnityBannerAd, {
        placementId: adUnitId,
        style,
        onLoaded: () => {},
        onFailed: () => {},
      });
    } catch {
      return null;
    }
  }

  async loadInterstitial(adUnitId: string) {
    try {
      const UnityAds = require('react-native-unity-ads').default;
      const placement = adUnitId || this.interstitialPlacement;
      await new Promise<void>((resolve) => {
        UnityAds.load(placement, {
          onComplete: () => { this._interstitialReady = true; resolve(); },
          onFailed: () => resolve(),
        });
      });
    } catch (e) {
      console.warn('[PeerAds/Unity] loadInterstitial failed:', e);
    }
  }

  showInterstitial() {
    if (!this._interstitialReady) return;
    try {
      const UnityAds = require('react-native-unity-ads').default;
      UnityAds.show(this.interstitialPlacement, {
        onStart: () => {},
        onSkipped: () => {},
        onComplete: () => {},
        onFailed: () => {},
      });
      this._interstitialReady = false;
    } catch { /* ignore */ }
  }

  async loadRewarded(adUnitId: string) {
    try {
      const UnityAds = require('react-native-unity-ads').default;
      const placement = adUnitId || this.rewardedPlacement;
      await new Promise<void>((resolve) => {
        UnityAds.load(placement, {
          onComplete: () => { this._rewardedReady = true; resolve(); },
          onFailed: () => resolve(),
        });
      });
    } catch (e) {
      console.warn('[PeerAds/Unity] loadRewarded failed:', e);
    }
  }

  showRewarded(onReward?: (type: string, amount: number) => void) {
    if (!this._rewardedReady) return;
    try {
      const UnityAds = require('react-native-unity-ads').default;
      UnityAds.show(this.rewardedPlacement, {
        onComplete: () => { onReward?.('unity_reward', 1); },
        onFailed: () => {},
        onSkipped: () => {},
        onStart: () => {},
      });
      this._rewardedReady = false;
    } catch { /* ignore */ }
  }
}
