export type NetworkConfig = Record<string, string>;

export type PeerAdsEnvironment = 'test' | 'production';

export interface PeerAdsConfig {
  /** Live public key: pk_live_... */
  apiKey: string;
  /** Live secret key: sk_live_... — server-side only */
  secretKey?: string;
  /** Test public key: pk_test_... */
  testApiKey?: string;
  /** Test secret key: sk_test_... — server-side only */
  testSecretKey?: string;
  /** 'test' uses pk_test_ key and returns mock ads. Default: 'production' */
  environment?: PeerAdsEnvironment;
  apiUrl?: string;
  peerPromotionPercent?: number;
  networks?: Partial<Record<'admob' | 'meta' | 'applovin' | 'unity' | 'ironsource', NetworkConfig>>;
  testMode?: boolean;
}

export interface AdResponse {
  id: string;
  type: string;
  source: 'peer' | 'bid' | 'self';
  network?: string;
  adUnitId?: string;
  creative: {
    title: string;
    description?: string;
    imageUrl?: string;
    ctaText: string;
    clickUrl: string;
  };
  trackingUrl: string;
  environment?: PeerAdsEnvironment;
}

export type AdSize = 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard';

export interface AdEventHandler {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: string) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
}
