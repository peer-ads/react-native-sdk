import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Modal,
  StyleSheet,
  BackHandler,
  AppState,
  type AppStateStatus,
} from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { PeerAds } from '../PeerAds';
import type { AdResponse } from '../types';
import { buildRewardedAdHtml } from './rewardedAdHtml';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PAReward {
  type: string;
  amount: number;
}

export interface RewardedAdRef {
  /** Pre-fetch the ad creative so show() is instant. */
  load: () => Promise<void>;
  /** Show the full-screen rewarded ad. */
  show: () => Promise<void>;
}

export interface RewardedAdProps {
  /** Fired when the user finishes watching — pre-unlock reward here. */
  onRewardAvailable?: (reward: PAReward) => void;
  /** Fired when the user taps "Claim Reward". Definitive grant signal. */
  onRewardEarned?: (reward: PAReward) => void;
  /** Fired after the overlay is fully dismissed. */
  onAdClosed?: () => void;
  /** Fired if the ad fails to load or show. */
  onAdFailed?: (error: string) => void;
  /** Seconds the user must watch. Defaults to 30. */
  duration?: number;
}

// ── Bridge ─────────────────────────────────────────────────────────────────────

const RN_BRIDGE =
  `window.ReactNativeWebView.postMessage(JSON.stringify({event:e,data:d}))`;

const DEFAULT_DURATION = 30;

// ── Component ─────────────────────────────────────────────────────────────────

export const RewardedAd = forwardRef<RewardedAdRef, RewardedAdProps>(
  (
    {
      onRewardAvailable,
      onRewardEarned,
      onAdClosed,
      onAdFailed,
      duration = DEFAULT_DURATION,
    },
    ref,
  ) => {
    const [visible,  setVisible]  = useState(false);
    const [htmlSrc,  setHtmlSrc]  = useState('');
    const [adData,   setAdData]   = useState<AdResponse | null>(null);

    const webViewRef   = useRef<WebView>(null);
    const eligibleRef  = useRef(false);
    const appStateRef  = useRef<AppStateStatus>(AppState.currentState);

    // ── AppState — pause/resume timer when app is backgrounded ────────────

    useEffect(() => {
      const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
        const prev = appStateRef.current;
        appStateRef.current = next;
        if (!visible) return;

        if (next === 'background' || next === 'inactive') {
          webViewRef.current?.injectJavaScript('window.PAAd&&window.PAAd.pause();true;');
        } else if (next === 'active' && (prev === 'background' || prev === 'inactive')) {
          if (!eligibleRef.current) {
            webViewRef.current?.injectJavaScript('window.PAAd&&window.PAAd.resume();true;');
          }
        }
      });
      return () => sub.remove();
    }, [visible]);

    // ── Android back button — blocked until eligible ───────────────────────

    useEffect(() => {
      if (!visible) return;
      const handler = BackHandler.addEventListener('hardwareBackPress', () => {
        return !eligibleRef.current; // true = consume (block back)
      });
      return () => handler.remove();
    }, [visible]);

    // ── Public API ────────────────────────────────────────────────────────

    const load = useCallback(async () => {
      try {
        const loaded = await PeerAds.loadRewarded();
        setAdData(loaded);
      } catch (e: unknown) {
        onAdFailed?.((e as Error).message ?? 'Failed to load rewarded ad');
        throw e;
      }
    }, [onAdFailed]);

    const show = useCallback(async () => {
      let ad = adData;
      if (!ad) {
        const loaded = await PeerAds.loadRewarded();
        setAdData(loaded);
        ad = loaded;
      }
      if (!ad) return;

      eligibleRef.current = false;
      setHtmlSrc(
        buildRewardedAdHtml(
          {
            adId:        ad.id,
            title:       ad.creative?.title       ?? '',
            description: ad.creative?.description ?? '',
            imageUrl:    ad.creative?.imageUrl    ?? '',
            duration,
          },
          RN_BRIDGE,
        ),
      );
      setVisible(true);
    }, [adData, duration]);

    useImperativeHandle(ref, () => ({ load, show }), [load, show]);

    // ── Bridge message handler ─────────────────────────────────────────────

    const onMessage = useCallback(
      (e: WebViewMessageEvent) => {
        let parsed: { event: string; data: PAReward & { adId?: string } };
        try {
          parsed = JSON.parse(e.nativeEvent.data);
        } catch {
          return;
        }
        const { event, data } = parsed;

        switch (event) {
          case 'impression':
            if (adData) void PeerAds.track(adData.id, 'impression');
            break;
          case 'rewardAvailable':
            eligibleRef.current = true;
            onRewardAvailable?.(data);
            break;
          case 'rewardEarned':
            onRewardEarned?.(data);
            break;
          case 'closed':
            setVisible(false);
            setAdData(null);
            onAdClosed?.();
            break;
        }
      },
      [adData, onRewardAvailable, onRewardEarned, onAdClosed],
    );

    // ── Render ────────────────────────────────────────────────────────────

    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        statusBarTranslucent
      >
        <WebView
          ref={webViewRef}
          source={{ html: htmlSrc }}
          style={styles.webview}
          javaScriptEnabled
          scrollEnabled={false}
          onMessage={onMessage}
          // Prevent the WebView itself from navigating away on link taps
          onShouldStartLoadWithRequest={() => true}
        />
      </Modal>
    );
  },
);

RewardedAd.displayName = 'RewardedAd';

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
