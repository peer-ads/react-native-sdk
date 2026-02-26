import { ViewStyle } from 'react-native';
import { AdNetworkAdapter, NetworkAdapterConfig } from './AdNetworkAdapter';

/**
 * AppLovin MAX adapter using `react-native-applovin-max`.
 * Install: npm install react-native-applovin-max
 * iOS: npx pod-install
 */
export class AppLovinAdapter implements AdNetworkAdapter {
  private _interstitialReady = false;
  private _rewardedReady = false;
  private sdkKey = '';

  get isInterstitialReady() { return this._interstitialReady; }
  get isRewardedReady() { return this._rewardedReady; }

  async initialize(config: NetworkAdapterConfig) {
    this.sdkKey = config.sdkKey ?? '';
    try {
      const AppLovinMAX = require('react-native-applovin-max').default;
      await AppLovinMAX.initialize(this.sdkKey);
    } catch {
      console.warn('[PeerAds/AppLovin] react-native-applovin-max not installed');
    }
  }

  getBannerComponent(adUnitId: string, style?: ViewStyle) {
    try {
      const { AdView, AdFormat } = require('react-native-applovin-max');
      const React = require('react');
      return () => React.createElement(AdView, {
        adUnitId,
        adFormat: AdFormat.BANNER,
        style,
      });
    } catch {
      return null;
    }
  }

  async loadInterstitial(adUnitId: string) {
    try {
      const AppLovinMAX = require('react-native-applovin-max').default;
      await new Promise<void>((resolve) => {
        AppLovinMAX.addAdLoadedEventListener('interstitial', () => {
          this._interstitialReady = true;
          resolve();
        });
        AppLovinMAX.loadInterstitial(adUnitId);
        setTimeout(resolve, 10_000); // timeout safety
      });
    } catch (e) {
      console.warn('[PeerAds/AppLovin] loadInterstitial failed:', e);
    }
  }

  showInterstitial() {
    if (!this._interstitialReady) return;
    try {
      const AppLovinMAX = require('react-native-applovin-max').default;
      AppLovinMAX.showInterstitial();
      this._interstitialReady = false;
    } catch { /* ignore */ }
  }

  async loadRewarded(adUnitId: string) {
    try {
      const AppLovinMAX = require('react-native-applovin-max').default;
      await new Promise<void>((resolve) => {
        AppLovinMAX.addAdLoadedEventListener('rewardedAd', () => {
          this._rewardedReady = true;
          resolve();
        });
        AppLovinMAX.loadRewardedAd(adUnitId);
        setTimeout(resolve, 10_000);
      });
    } catch (e) {
      console.warn('[PeerAds/AppLovin] loadRewarded failed:', e);
    }
  }

  showRewarded(onReward?: (type: string, amount: number) => void) {
    if (!this._rewardedReady) return;
    try {
      const AppLovinMAX = require('react-native-applovin-max').default;
      AppLovinMAX.addAdRewardedEventListener('rewardedAd', (reward: any) => {
        onReward?.(reward?.rewardLabel ?? 'coins', reward?.rewardAmount ?? 0);
      });
      AppLovinMAX.showRewardedAd();
      this._rewardedReady = false;
    } catch { /* ignore */ }
  }
}
