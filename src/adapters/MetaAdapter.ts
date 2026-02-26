import { ViewStyle } from 'react-native';
import { AdNetworkAdapter, NetworkAdapterConfig } from './AdNetworkAdapter';

/**
 * Meta Audience Network adapter using `react-native-fbads`.
 * Install: npm install react-native-fbads
 * iOS: npx pod-install
 * Configure your Meta App ID in Info.plist / AndroidManifest.xml
 */
export class MetaAdapter implements AdNetworkAdapter {
  private _interstitialReady = false;
  private _rewardedReady = false;
  private _interstitialAd: any = null;

  get isInterstitialReady() { return this._interstitialReady; }
  get isRewardedReady() { return this._rewardedReady; }

  async initialize(config: NetworkAdapterConfig) {
    try {
      const { AdsManager } = require('react-native-fbads');
      AdsManager.setTestDevices?.(config.testDeviceId ? [config.testDeviceId] : []);
    } catch {
      console.warn('[PeerAds/Meta] react-native-fbads not installed');
    }
  }

  getBannerComponent(adUnitId: string, style?: ViewStyle) {
    try {
      const { BannerView } = require('react-native-fbads');
      const React = require('react');
      return () => React.createElement(BannerView, {
        placementId: adUnitId,
        type: 'standard',
        style,
        onPress: () => {},
        onError: (err: Error) => console.warn('[PeerAds/Meta] banner error', err),
      });
    } catch {
      return null;
    }
  }

  async loadInterstitial(adUnitId: string) {
    try {
      const { InterstitialAdManager } = require('react-native-fbads');
      this._interstitialAd = { placementId: adUnitId };
      await InterstitialAdManager.loadAd(adUnitId);
      this._interstitialReady = true;
    } catch (e) {
      console.warn('[PeerAds/Meta] loadInterstitial failed:', e);
    }
  }

  showInterstitial() {
    if (!this._interstitialAd || !this._interstitialReady) return;
    try {
      const { InterstitialAdManager } = require('react-native-fbads');
      InterstitialAdManager.showAd(this._interstitialAd.placementId).catch(() => {});
      this._interstitialReady = false;
    } catch { /* ignore */ }
  }

  async loadRewarded(adUnitId: string) {
    try {
      const { RewardedVideoAdManager } = require('react-native-fbads');
      await RewardedVideoAdManager.loadAd(adUnitId);
      this._rewardedReady = true;
    } catch (e) {
      console.warn('[PeerAds/Meta] loadRewarded failed:', e);
    }
  }

  showRewarded(onReward?: (type: string, amount: number) => void) {
    // Meta rewarded video fires reward on completion — no specific reward data
    try {
      const { RewardedVideoAdManager } = require('react-native-fbads');
      RewardedVideoAdManager.showAd?.()
        .then(() => onReward?.('meta_reward', 1))
        .catch(() => {});
      this._rewardedReady = false;
    } catch { /* ignore */ }
  }
}
