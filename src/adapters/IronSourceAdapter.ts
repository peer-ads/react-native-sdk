import { ViewStyle } from 'react-native';
import { AdNetworkAdapter, NetworkAdapterConfig } from './AdNetworkAdapter';

/**
 * IronSource adapter using `react-native-ironsource`.
 * Install: npm install react-native-ironsource
 * iOS: npx pod-install
 * Set your App Key in config.appKey
 */
export class IronSourceAdapter implements AdNetworkAdapter {
  private _interstitialReady = false;
  private _rewardedReady = false;
  private appKey = '';

  get isInterstitialReady() { return this._interstitialReady; }
  get isRewardedReady() { return this._rewardedReady; }

  async initialize(config: NetworkAdapterConfig) {
    this.appKey = config.appKey ?? '';
    try {
      const IronSource = require('react-native-ironsource').default;
      IronSource.setAdaptersDebug(false);
      await new Promise<void>((resolve) => {
        IronSource.init(this.appKey, () => resolve());
      });
    } catch {
      console.warn('[PeerAds/IronSource] react-native-ironsource not installed');
    }
  }

  getBannerComponent(adUnitId: string, style?: ViewStyle) {
    try {
      const { IronSourceBannerView } = require('react-native-ironsource');
      const React = require('react');
      return () => React.createElement(IronSourceBannerView, {
        instanceId: adUnitId ? parseInt(adUnitId, 10) : 0,
        style,
      });
    } catch {
      return null;
    }
  }

  async loadInterstitial(_adUnitId: string) {
    try {
      const IronSource = require('react-native-ironsource').default;
      await new Promise<void>((resolve) => {
        IronSource.addImpressionDataDelegate({
          impressionDataDidSucceed: () => {},
        });
        IronSource.setInterstitialListener({
          interstitialDidLoad: () => { this._interstitialReady = true; resolve(); },
          interstitialDidFailToLoad: () => resolve(),
          interstitialDidOpen: () => {},
          interstitialDidClose: () => {},
          interstitialDidShow: () => {},
          interstitialDidFailToShow: () => {},
          didClickInterstitial: () => {},
        });
        IronSource.loadInterstitial();
      });
    } catch (e) {
      console.warn('[PeerAds/IronSource] loadInterstitial failed:', e);
    }
  }

  showInterstitial() {
    if (!this._interstitialReady) return;
    try {
      const IronSource = require('react-native-ironsource').default;
      IronSource.showInterstitial();
      this._interstitialReady = false;
    } catch { /* ignore */ }
  }

  async loadRewarded(_adUnitId: string) {
    try {
      const IronSource = require('react-native-ironsource').default;
      await new Promise<void>((resolve) => {
        IronSource.setRewardedVideoListener({
          rewardedVideoAvailabilityChanged: (available: boolean) => {
            if (available) { this._rewardedReady = true; resolve(); }
          },
          rewardedVideoDidReceiveReward: () => {},
          rewardedVideoDidFailToShow: () => resolve(),
          rewardedVideoDidOpen: () => {},
          rewardedVideoDidClose: () => {},
          rewardedVideoDidStart: () => {},
          rewardedVideoDidEnd: () => {},
          didClickRewardedVideo: () => {},
        });
        IronSource.loadRewardedVideo();
        setTimeout(resolve, 10_000);
      });
    } catch (e) {
      console.warn('[PeerAds/IronSource] loadRewarded failed:', e);
    }
  }

  showRewarded(onReward?: (type: string, amount: number) => void) {
    if (!this._rewardedReady) return;
    try {
      const IronSource = require('react-native-ironsource').default;
      IronSource.setRewardedVideoListener({
        rewardedVideoDidReceiveReward: (placement: any) => {
          onReward?.(placement?.rewardName ?? 'coins', placement?.rewardAmount ?? 0);
        },
        rewardedVideoAvailabilityChanged: () => {},
        rewardedVideoDidFailToShow: () => {},
        rewardedVideoDidOpen: () => {},
        rewardedVideoDidClose: () => {},
        rewardedVideoDidStart: () => {},
        rewardedVideoDidEnd: () => {},
        didClickRewardedVideo: () => {},
      });
      IronSource.showRewardedVideo();
      this._rewardedReady = false;
    } catch { /* ignore */ }
  }
}
