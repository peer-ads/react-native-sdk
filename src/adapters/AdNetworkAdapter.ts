import { ViewStyle } from 'react-native';

export type AdSlotType = 'banner' | 'interstitial' | 'rewarded';

export interface NetworkAdapterConfig {
  [key: string]: string;
}

export interface AdNetworkAdapter {
  /** Initialize the network SDK. Call once from PeerAds.initialize(). */
  initialize(config: NetworkAdapterConfig): Promise<void>;
  /** Load a banner — returns a React component to mount in your view tree */
  getBannerComponent(adUnitId: string, style?: ViewStyle): React.ComponentType | null;
  /** Pre-load an interstitial */
  loadInterstitial(adUnitId: string): Promise<void>;
  /** Show a pre-loaded interstitial */
  showInterstitial(): void;
  /** Pre-load a rewarded ad */
  loadRewarded(adUnitId: string): Promise<void>;
  /** Show a pre-loaded rewarded ad */
  showRewarded(onReward?: (type: string, amount: number) => void): void;
  readonly isInterstitialReady: boolean;
  readonly isRewardedReady: boolean;
}
