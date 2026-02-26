import { ViewStyle } from 'react-native';
import { AdNetworkAdapter, NetworkAdapterConfig } from './AdNetworkAdapter';

/**
 * AdMob adapter using `react-native-google-mobile-ads`.
 * Install: npm install react-native-google-mobile-ads
 * iOS: npx pod-install
 * Add google_app_id to Info.plist / AndroidManifest.xml
 */
export class AdMobAdapter implements AdNetworkAdapter {
  private _interstitialReady = false;
  private _rewardedReady = false;
  private _interstitialAd: any = null;
  private _rewardedAd: any = null;

  get isInterstitialReady() { return this._interstitialReady; }
  get isRewardedReady() { return this._rewardedReady; }

  async initialize(_config: NetworkAdapterConfig) {
    try {
      const mobileAds = require('react-native-google-mobile-ads').default;
      await mobileAds().initialize();
    } catch {
      console.warn('[PeerAds/AdMob] react-native-google-mobile-ads not installed');
    }
  }

  getBannerComponent(adUnitId: string, style?: ViewStyle) {
    try {
      const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
      const React = require('react');
      return () => React.createElement(BannerAd, {
        unitId: adUnitId,
        size: BannerAdSize.BANNER,
        requestOptions: { requestNonPersonalizedAdsOnly: false },
        style,
      });
    } catch {
      return null;
    }
  }

  async loadInterstitial(adUnitId: string) {
    try {
      const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');
      this._interstitialAd = InterstitialAd.createForAdRequest(adUnitId);
      await new Promise<void>((resolve, reject) => {
        const unsubLoaded = this._interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
          this._interstitialReady = true;
          unsubLoaded();
          resolve();
        });
        const unsubError = this._interstitialAd.addAdEventListener(AdEventType.ERROR, (e: Error) => {
          unsubError();
          reject(e);
        });
        this._interstitialAd.load();
      });
    } catch (e) {
      console.warn('[PeerAds/AdMob] loadInterstitial failed:', e);
    }
  }

  showInterstitial() {
    if (this._interstitialAd && this._interstitialReady) {
      this._interstitialAd.show();
      this._interstitialReady = false;
    }
  }

  async loadRewarded(adUnitId: string) {
    try {
      const { RewardedAd, RewardedAdEventType } = require('react-native-google-mobile-ads');
      this._rewardedAd = RewardedAd.createForAdRequest(adUnitId);
      await new Promise<void>((resolve, reject) => {
        const unsubLoaded = this._rewardedAd.addAdEventListener(
          RewardedAdEventType.LOADED, () => { this._rewardedReady = true; unsubLoaded(); resolve(); }
        );
        const unsubError = this._rewardedAd.addAdEventListener(
          RewardedAdEventType.ERROR, (e: Error) => { unsubError(); reject(e); }
        );
        this._rewardedAd.load();
      });
    } catch (e) {
      console.warn('[PeerAds/AdMob] loadRewarded failed:', e);
    }
  }

  showRewarded(onReward?: (type: string, amount: number) => void) {
    if (!this._rewardedAd || !this._rewardedReady) return;
    try {
      const { RewardedAdEventType } = require('react-native-google-mobile-ads');
      this._rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: { type: string; amount: number }) => onReward?.(reward.type, reward.amount),
      );
    } catch { /* ignore if not installed */ }
    this._rewardedAd.show();
    this._rewardedReady = false;
  }
}
