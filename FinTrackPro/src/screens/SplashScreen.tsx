import React, { useEffect, useRef } from 'react';
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
  // Guard against the Reanimated 3 worklet callback firing after unmount.
  // On Android the worklet runs on the UI thread and can outlive the JS thread
  // unmount; calling onDone() then throws "Tried to assign to value of an
  // already-destroyed shared value" and auto-closes the app.
  const mountedRef = useRef(true);

  const { onboardingDone, user } = useApp();

  useEffect(() => {
    mountedRef.current = true;
    opacity.value = withTiming(1, { duration: 700 });
    scale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => {
      try {
        fadeOut.value = withTiming(0, { duration: 600 }, () => {
          // Only call onDone if the component is still mounted. The worklet
          // callback runs on the UI thread; by the time it fires the JS-side
          // component may have unmounted.
          // Use the bridge to check the JS ref — safe in Reanimated 3 callbacks.
          if (mountedRef.current) {
            try { onDone(); } catch (e) { /* swallow — we're unmounted */ }
          }
        });
      } catch (err) {
        // Fallback: still call onDone after a beat so the app never freezes on splash.
        setTimeout(() => {
          if (mountedRef.current) {
            try { onDone(); } catch (e) { /* ignore */ }
          }
        }, 700);
      }
    }, 2200);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
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