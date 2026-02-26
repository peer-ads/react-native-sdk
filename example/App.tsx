/**
 * PeerAds React Native SDK — Demo App
 *
 * Demonstrates: Banner, Interstitial, Rewarded ads + DAU reporting.
 *
 * Run:
 *   cd example
 *   npm install
 *   npx react-native run-ios   # or run-android
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  PeerAds,
  BannerAd,
  InterstitialAd,
  RewardedAd,
} from '@peerads/react-native';

// ---------------------------------------------------------------------------
// 1. SDK initialisation — call once before rendering any ad components
// ---------------------------------------------------------------------------
PeerAds.initialize({
  apiKey: 'pk_test_REPLACE_ME',   // ← replace with your test key
  environment: 'test',
  testMode: true,
  debug: true,
  peerPromotionPercent: 90,
}).catch(console.error);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type LogEntry = { id: number; level: 'ok' | 'err' | 'info'; msg: string };

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 0, level: 'info', msg: 'SDK initialising…' }]);
  const [interstitialLoading, setInterstitialLoading] = useState(false);
  const [rewardedLoading, setRewardedLoading]         = useState(false);
  const [dauReported, setDauReported]                 = useState(false);

  const interstitialRef = useRef<InstanceType<typeof InterstitialAd>>(null);
  const rewardedRef     = useRef<InstanceType<typeof RewardedAd>>(null);
  const logIdRef        = useRef(1);

  const log = (level: LogEntry['level'], msg: string) => {
    const id = logIdRef.current++;
    setLogs(prev => [{ id, level, msg }, ...prev].slice(0, 30));
  };

  // Report DAU once on mount
  useEffect(() => {
    PeerAds.reportDau(5000)
      .then(() => { log('ok', 'DAU reported: 5 000'); setDauReported(true); })
      .catch(err  => log('err', `DAU error: ${err.message}`));
  }, []);

  // ---- Interstitial --------------------------------------------------------
  const handleInterstitial = async () => {
    setInterstitialLoading(true);
    try {
      await interstitialRef.current?.load();
      await interstitialRef.current?.show();
    } catch (e: any) {
      log('err', `Interstitial error: ${e.message}`);
    } finally {
      setInterstitialLoading(false);
    }
  };

  // ---- Rewarded ------------------------------------------------------------
  const handleRewarded = async () => {
    setRewardedLoading(true);
    try {
      await rewardedRef.current?.show();
    } catch (e: any) {
      log('err', `Rewarded error: ${e.message}`);
    } finally {
      setRewardedLoading(false);
    }
  };

  // ---- Manual ad request ---------------------------------------------------
  const handleManualRequest = async () => {
    try {
      const ad = await PeerAds.requestAd('banner', 'slot-001');
      log('ok', `Ad response  source=${ad.source}  network=${ad.network ?? 'self'}  id=${ad.id}`);
      // Manually track impression
      PeerAds.track(ad.id, 'impression');
      log('info', 'Impression tracked');
    } catch (e: any) {
      log('err', `Request error: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PeerAds SDK Demo</Text>
          <Text style={styles.headerSub}>React Native · v0.1.0</Text>
        </View>

        {/* ── Banner Ad ──────────────────────────────────────────────────── */}
        <Card title="Banner Ad">
          <BannerAd
            size="banner"
            style={styles.banner}
            onAdLoaded={()           => log('ok',  'Banner loaded')}
            onAdFailedToLoad={err   => log('err', `Banner failed: ${err}`)}
            onAdClicked={()         => log('info', 'Banner clicked')}
          />
          <Text style={styles.hint}>size="banner" (320×50)</Text>

          {/* Medium Rectangle */}
          <BannerAd
            size="mediumRectangle"
            style={[styles.banner, { height: 250, marginTop: 12 }]}
            onAdLoaded={()           => log('ok',  'MedRect loaded')}
            onAdFailedToLoad={err   => log('err', `MedRect failed: ${err}`)}
          />
          <Text style={styles.hint}>size="mediumRectangle" (300×250)</Text>
        </Card>

        {/* ── Interstitial Ad ────────────────────────────────────────────── */}
        <Card title="Interstitial Ad">
          <InterstitialAd
            ref={interstitialRef}
            onAdClosed={() => log('info', 'Interstitial closed')}
            onAdClicked={() => log('info', 'Interstitial clicked')}
          />
          <ActionButton
            label="Load &amp; Show Interstitial"
            onPress={handleInterstitial}
            loading={interstitialLoading}
            color="#6366f1"
          />
          <Text style={styles.hint}>Loads an interstitial, then shows it immediately.</Text>
        </Card>

        {/* ── Rewarded Ad ────────────────────────────────────────────────── */}
        <Card title="Rewarded Ad">
          <RewardedAd
            ref={rewardedRef}
            onRewardEarned={reward => {
              log('ok', `Reward earned: ${reward.amount} ${reward.type}`);
              Alert.alert('Reward!', `You earned ${reward.amount} ${reward.type}`);
            }}
            onAdClosed={() => log('info', 'Rewarded closed')}
          />
          <ActionButton
            label="Watch Rewarded Ad"
            onPress={handleRewarded}
            loading={rewardedLoading}
            color="#10b981"
          />
          <Text style={styles.hint}>User watches ad to completion to earn a reward.</Text>
        </Card>

        {/* ── Manual Ad Request ──────────────────────────────────────────── */}
        <Card title="Manual Ad Request">
          <ActionButton
            label="Request Ad (slot-001, banner)"
            onPress={handleManualRequest}
            color="#f59e0b"
          />
          <Text style={styles.hint}>
            Calls PeerAds.requestAd() and logs the raw response (source: peer | bid | self).
          </Text>
        </Card>

        {/* ── DAU Status ─────────────────────────────────────────────────── */}
        <Card title="DAU Reporting">
          <View style={styles.dauRow}>
            <View style={[styles.dauDot, dauReported ? styles.dotGreen : styles.dotGray]} />
            <Text style={styles.dauText}>
              {dauReported ? 'DAU = 5 000 reported on mount' : 'Reporting…'}
            </Text>
          </View>
          <Text style={styles.hint}>Call PeerAds.reportDau(n) once per app session.</Text>
        </Card>

        {/* ── Event Log ──────────────────────────────────────────────────── */}
        <Card title="Event Log">
          <View style={styles.logBox}>
            {logs.map(entry => (
              <Text
                key={entry.id}
                style={[
                  styles.logEntry,
                  entry.level === 'ok'  && styles.logOk,
                  entry.level === 'err' && styles.logErr,
                ]}
              >
                {entry.msg}
              </Text>
            ))}
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ActionButton({
  label, onPress, loading = false, color,
}: { label: string; onPress: () => void; loading?: boolean; color: string }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color, opacity: loading ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.buttonText}>{label}</Text>}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f1f5f9' },
  scroll:      { padding: 16, paddingBottom: 40 },
  header:      { backgroundColor: '#0f172a', borderRadius: 12, padding: 20, marginBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub:   { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                 shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle:   { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  banner:      { width: '100%', height: 50, borderWidth: 1, borderColor: '#e2e8f0',
                 borderRadius: 6, backgroundColor: '#f8fafc' },
  button:      { borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  buttonText:  { color: '#fff', fontWeight: '600', fontSize: 14 },
  hint:        { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  dauRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dauDot:      { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  dotGreen:    { backgroundColor: '#10b981' },
  dotGray:     { backgroundColor: '#d1d5db' },
  dauText:     { fontSize: 13, color: '#374151' },
  logBox:      { backgroundColor: '#0f172a', borderRadius: 8, padding: 12, maxHeight: 200 },
  logEntry:    { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
                 fontSize: 11, color: '#94a3b8', marginBottom: 3 },
  logOk:       { color: '#34d399' },
  logErr:      { color: '#f87171' },
});
