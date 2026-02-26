import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Linking, StyleSheet, Dimensions } from 'react-native';
import { PeerAds } from '../PeerAds';
import { AdEventHandler } from '../types';

interface InterstitialAdProps extends AdEventHandler {}

export function InterstitialAd({ onAdClosed, onAdClicked }: InterstitialAdProps) {
  const [visible, setVisible] = useState(false);
  const [ad, setAd] = useState<{ id: string; creative: { title: string; description?: string; ctaText: string; clickUrl: string } } | null>(null);

  const load = async () => {
    const loaded = await PeerAds.requestAd('interstitial', 'interstitial');
    setAd(loaded);
    return loaded;
  };

  const show = async () => {
    const loaded = ad ?? await load();
    setAd(loaded);
    setVisible(true);
    PeerAds.track(loaded.id, 'impression');
  };

  const close = () => {
    if (ad) PeerAds.track(ad.id, 'close');
    setVisible(false);
    onAdClosed?.();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.close} onPress={close}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{ad?.creative.title}</Text>
            <Text style={styles.desc}>{ad?.creative.description}</Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => {
                if (ad) { PeerAds.track(ad.id, 'click'); Linking.openURL(ad.creative.clickUrl); }
                onAdClicked?.();
              }}
            >
              <Text style={styles.ctaText}>{ad?.creative.ctaText ?? 'Learn More'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 28, width: width * 0.85, alignItems: 'center', position: 'relative' },
  close: { position: 'absolute', top: 14, right: 14 },
  closeText: { fontSize: 18, color: '#6b7280' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  cta: { backgroundColor: '#4f46e5', borderRadius: 999, paddingHorizontal: 28, paddingVertical: 12 },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
