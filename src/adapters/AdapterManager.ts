import { AdNetworkAdapter, NetworkAdapterConfig } from './AdNetworkAdapter';
import { AdMobAdapter } from './AdMobAdapter';
import { MetaAdapter } from './MetaAdapter';
import { AppLovinAdapter } from './AppLovinAdapter';
import { UnityAdapter } from './UnityAdapter';
import { IronSourceAdapter } from './IronSourceAdapter';

export type NetworkName = 'admob' | 'meta' | 'applovin' | 'unity' | 'ironsource';

const FACTORIES: Record<NetworkName, () => AdNetworkAdapter> = {
  admob: () => new AdMobAdapter(),
  meta: () => new MetaAdapter(),
  applovin: () => new AppLovinAdapter(),
  unity: () => new UnityAdapter(),
  ironsource: () => new IronSourceAdapter(),
};

export class AdapterManager {
  private adapters = new Map<NetworkName, AdNetworkAdapter>();

  private get(name: NetworkName): AdNetworkAdapter {
    if (!this.adapters.has(name)) {
      this.adapters.set(name, FACTORIES[name]?.() ?? new AdMobAdapter());
    }
    return this.adapters.get(name)!;
  }

  async initializeAll(networksConfig: Partial<Record<NetworkName, NetworkAdapterConfig>>) {
    await Promise.all(
      (Object.keys(networksConfig) as NetworkName[]).map((name) =>
        this.get(name).initialize(networksConfig[name] ?? {}),
      ),
    );
  }

  getBannerComponent(network: string, adUnitId: string) {
    return this.get(network as NetworkName).getBannerComponent(adUnitId);
  }

  async loadInterstitial(network: string, adUnitId: string) {
    return this.get(network as NetworkName).loadInterstitial(adUnitId);
  }

  showInterstitial(network: string) {
    this.get(network as NetworkName).showInterstitial();
  }

  async loadRewarded(network: string, adUnitId: string) {
    return this.get(network as NetworkName).loadRewarded(adUnitId);
  }

  showRewarded(network: string, onReward?: (type: string, amount: number) => void) {
    this.get(network as NetworkName).showRewarded(onReward);
  }

  isInterstitialReady(network: string) {
    return this.adapters.get(network as NetworkName)?.isInterstitialReady ?? false;
  }

  isRewardedReady(network: string) {
    return this.adapters.get(network as NetworkName)?.isRewardedReady ?? false;
  }
}
