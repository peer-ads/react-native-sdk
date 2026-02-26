import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { PeerAds } from '../PeerAds';
import { AdSize, AdEventHandler } from '../types';

interface BannerAdProps extends AdEventHandler {
  size?: AdSize;
  style?: object;
}

const SIZE_MAP: Record<AdSize, { width: number; height: number }> = {
  banner: { width: 320, height: 50 },
  largeBanner: { width: 320, height: 100 },
  mediumRectangle: { width: 300, height: 250 },
  fullBanner: { width: 468, height: 60 },
  leaderboard: { width: 728, height: 90 },
};

export function BannerAd({ size = 'banner', style, onAdLoaded, onAdFailedToLoad, onAdClicked }: BannerAdProps) {
  const [ad, setAd] = useState<{ id: string; creative: { title: string; clickUrl: string } } | null>(null);
  const dims = SIZE_MAP[size];

  useEffect(() => {
    PeerAds.requestAd('banner', size)
      .then((loaded) => {
        setAd(loaded);
        PeerAds.track(loaded.id, 'impression');
        onAdLoaded?.();
      })
      .catch((e) => onAdFailedToLoad?.(e.message));
  }, []);

  if (!ad) return <View style={[styles.container, dims, style]} />;

  return (
    <TouchableOpacity
      style={[styles.banner, dims, style]}
      onPress={() => {
        PeerAds.track(ad.id, 'click');
        onAdClicked?.();
        Linking.openURL(ad.creative.clickUrl);
      }}
    >
      <Text style={styles.text}>{ad.creative.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f3f4f6', borderRadius: 6 },
  banner: { backgroundColor: '#eef2ff', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e7ff' },
  text: { fontSize: 13, color: '#4338ca', fontWeight: '600' },
});
