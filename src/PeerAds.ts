import { PeerAdsConfig, AdResponse } from './types';
import { AdapterManager } from './adapters/AdapterManager';

let config: PeerAdsConfig | null = null;
let adapterManager: AdapterManager | null = null;
const DEFAULT_API = 'https://api.peerads.io/api/v1';

function activeApiKey(): string {
  const c = config!;
  if (c.environment === 'test') {
    if (!c.testApiKey) throw new Error('[PeerAds] testApiKey required when environment is "test"');
    return c.testApiKey;
  }
  return c.apiKey;
}

function activeSecretKey(): string | undefined {
  const c = config!;
  return c.environment === 'test' ? c.testSecretKey : c.secretKey;
}

export const PeerAds = {
  async initialize(cfg: PeerAdsConfig): Promise<void> {
    config = { peerPromotionPercent: 90, apiUrl: DEFAULT_API, environment: 'production', ...cfg };

    if (cfg.networks && Object.keys(cfg.networks).length > 0) {
      adapterManager = new AdapterManager();
      await adapterManager.initializeAll(cfg.networks as Record<string, Record<string, string>>);
    }

    if (cfg.testMode || cfg.environment === 'test') {
      console.log(`[PeerAds] SDK initialized (${config.environment}) for`, cfg.apiKey);
    }
  },

  getConfig(): PeerAdsConfig {
    if (!config) throw new Error('[PeerAds] Call PeerAds.initialize() first');
    return config;
  },

  getEnvironment() { return config?.environment ?? 'production'; },

  async requestAd(type: string, slotId: string): Promise<AdResponse> {
    const cfg = this.getConfig();
    const res = await fetch(`${cfg.apiUrl}/ads/serve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: activeApiKey(), slotType: type, platform: 'react-native' }),
    });
    const { ad, environment } = await res.json();
    return { ...ad, environment } as AdResponse;
  },

  track(adId: string, event: string): void {
    const cfg = this.getConfig();
    fetch(`${cfg.apiUrl}/ads/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, event }),
    }).catch(() => {});
  },

  /**
   * Report your app's DAU to PeerAds.
   * Uses the secret key — call from your server-side Node.js code, not the app bundle.
   */
  async reportDau(dau: number): Promise<void> {
    const cfg = this.getConfig();
    const sk = activeSecretKey();
    if (!sk) throw new Error('[PeerAds] secretKey or testSecretKey required to call reportDau()');
    await fetch(`${cfg.apiUrl}/apps/dau`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-PeerAds-Secret-Key': sk },
      body: JSON.stringify({ dau }),
    });
  },

  getAdapterManager(): AdapterManager | null { return adapterManager; },

  async loadInterstitial(adUnitId = ''): Promise<AdResponse> {
    const ad = await this.requestAd('interstitial', 'interstitial');
    if (ad.source === 'self' && ad.network && adapterManager) {
      await adapterManager.loadInterstitial(ad.network, ad.adUnitId ?? adUnitId);
    }
    return ad;
  },

  showInterstitial(ad: AdResponse): void {
    if (ad.source === 'self' && ad.network && adapterManager) {
      adapterManager.showInterstitial(ad.network);
      this.track(ad.id, 'impression');
    }
  },

  async loadRewarded(adUnitId = ''): Promise<AdResponse> {
    const ad = await this.requestAd('rewarded', 'rewarded');
    if (ad.source === 'self' && ad.network && adapterManager) {
      await adapterManager.loadRewarded(ad.network, ad.adUnitId ?? adUnitId);
    }
    return ad;
  },

  showRewarded(ad: AdResponse, onReward?: (type: string, amount: number) => void): void {
    if (ad.source === 'self' && ad.network && adapterManager) {
      adapterManager.showRewarded(ad.network, onReward);
      this.track(ad.id, 'impression');
    }
  },
};
