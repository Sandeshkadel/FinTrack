import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

interface SplashProps {
  onDone: () => void;
}

/**
 * Splash screen — fades in logo, scales up, then fades out.
 * Mirrors the web version's logo zoom-in/zoom-out animation.
 */
export function SplashScreen({ onDone }: SplashProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const fadeOut = useSharedValue(1);

  const { onboardingDone, user } = useApp();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 700 });
    scale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => {
      fadeOut.value = withTiming(0, { duration: 600 }, () => {
        onDone();
      });
    }, 2200);
    return () => clearTimeout(timer);
  }, [opacity, scale, fadeOut, onDone]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, containerStyle]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.bg} />
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image
          source={require('@/assets/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.text}>
          <Text style={styles.brand}>FinTrack</Text>
          <Text style={styles.tag}>Pro Ultimate</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 18,
  },
  text: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tag: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    letterSpacing: 1.4,
  },
});