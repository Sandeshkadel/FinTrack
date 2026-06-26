import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';
import { Button } from '@/components/Button';
import { authService } from '@/services/authService';

interface Props {
  onUnlocked: () => void;
  onSignOut: () => void;
}

/**
 * Full-screen lock that gates the main app behind the device's biometric.
 *
 * Behaviour:
 *   - Auto-prompts for biometric on mount.
 *   - On success → onUnlocked() (caller switches phase to 'main').
 *   - On failure → stays here, allows the user to retry.
 *   - If the device has no biometric hardware / is not enrolled, automatically
 *     falls through to onUnlocked() so the user is never trapped behind a
 *     lock they cannot open.
 *   - "Sign out" ends the session and returns the caller to the auth flow.
 */
export function BiometricLockScreen({ onUnlocked, onSignOut }: Props) {
  const theme = useAppTheme();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string>('Authenticating…');
  // Guard against the auto-prompt firing twice (e.g. StrictMode double effect,
  // or focus/blur races) — we only want one biometric dialog at a time.
  const inFlight = useRef(false);

  const tryUnlock = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setHint('Authenticating…');
    try {
      const avail = await authService.isBiometricsAvailable();
      if (!avail.available || !avail.enrolled) {
        // The user enabled biometric lock at some point but the device has
        // since lost its enrolment (rare but possible). Don't trap them —
        // let them in.
        onUnlocked();
        return;
      }
      const res = await authService.authenticateWithBiometrics({
        promptMessage: 'Unlock FinTrack Pro',
        cancelLabel: 'Cancel',
      });
      if (res.success) {
        onUnlocked();
        return;
      }
      const err = res.error || 'failed';
      if (err === 'user_cancel') {
        setHint('Tap “Unlock” to try again.');
      } else if (err === 'lockout' || err === 'lockout_permanent') {
        setHint('Too many attempts. Unlock your device, then try again.');
      } else if (err === 'no_hardware' || err === 'not_enrolled') {
        setHint('Biometrics unavailable on this device. Tap Sign out to switch accounts.');
      } else {
        setHint('Authentication failed. Tap “Unlock” to try again.');
      }
    } catch (err) {
      setHint(`Could not start authentication: ${(err as Error).message}`);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  useEffect(() => {
    // Fire the prompt automatically on mount; the user can also tap "Unlock".
    tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.brandWrap}>
        <View style={[styles.logoBlob, { backgroundColor: COLORS.primary }]}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} contentFit="contain" />
        </View>
        <Text style={[styles.brand, { color: theme.text }]}>FinTrack Pro</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>
          Your financial data is locked.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.actions}>
        <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '22' }]}>
          <Ionicons name="lock-closed" size={36} color={COLORS.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Unlock to continue</Text>
        <Text style={[styles.hint, { color: theme.textMuted }]}>{hint}</Text>

        <Button
          title="Unlock with biometrics"
          onPress={tryUnlock}
          icon="finger-print"
          size="lg"
          fullWidth
          loading={busy}
          style={{ marginTop: 18 }}
        />

        <Pressable onPress={onSignOut} hitSlop={10} style={styles.signOut}>
          <Ionicons name="log-out-outline" size={16} color={theme.textMuted} />
          <Text style={[styles.signOutText, { color: theme.textMuted }]}>
            Sign out instead
          </Text>
        </Pressable>
      </Animated.View>

      <Text style={[styles.legal, { color: theme.textFaint }]}>
        🔒 Your data stays on this device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  brandWrap: {
    alignItems: 'center',
  },
  logoBlob: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logo: { width: 64, height: 64 },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  signOut: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
    textAlign: 'center',
  },
});
