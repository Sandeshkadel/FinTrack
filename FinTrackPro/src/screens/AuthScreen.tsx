import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { authService } from '@/services/authService';

interface Props {
  onAuthenticated: () => void;
}

type Mode = 'signin' | 'signup';

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Too weak', color: '#ef4444' },
    1: { label: 'Weak', color: '#f97316' },
    2: { label: 'Fair', color: '#f59e0b' },
    3: { label: 'Good', color: '#10b981' },
    4: { label: 'Strong', color: '#059669' },
  };
  return { score: s as 0 | 1 | 2 | 3 | 4, ...map[s] };
}

export function AuthScreen({ onAuthenticated }: Props) {
  const theme = useAppTheme();
  const { user, signInCompleted } = useApp();
  // AuthScreen authenticates via authService which persists user to storage;
  // AppProvider rehydrates from storage on mount, so we call onAuthenticated()
  // to signal the root navigator to switch to the main app.
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const strength = useMemo(() => passwordStrength(password), [password]);

  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (mode === 'signup' && name.trim().length < 2) {
      e.name = 'Please enter your full name';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (mode === 'signup' && strength.score < 2) {
      e.password = 'Choose a stronger password';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = mode === 'signin'
        ? await authService.signIn(email.trim().toLowerCase(), password)
        : await authService.signUp(name.trim(), email.trim().toLowerCase(), password);
      if (user) {
        await signInCompleted();
        onAuthenticated();
      }
    } catch (err) {
      Alert.alert(mode === 'signin' ? 'Sign in failed' : 'Sign up failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const tryBiometrics = async () => {
    try {
      const ok = await authService.authenticateWithBiometrics();
      if (!ok) {
        Alert.alert('Biometric sign-in failed', 'Authentication was unsuccessful.');
        return;
      }
      const current = await authService.getCurrentUser();
      if (current) {
        await signInCompleted();
        onAuthenticated();
      }
    } catch (err) {
      Alert.alert('Biometric sign-in failed', (err as Error).message);
    }
  };

  const [biometricsAvailable, setBiometricsAvailable] = useState<{ available: boolean; enrolled: boolean }>({ available: false, enrolled: false });

  useEffect(() => {
    let mounted = true;
    authService.isBiometricsAvailable().then((v) => {
      if (mounted) setBiometricsAvailable(v);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: theme.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} style={styles.hero}>
          <View style={styles.logoBlob}>
            <Image source={require('@/assets/icon.png')} style={styles.logo} contentFit="contain" />
          </View>
          <Text style={[styles.brand, { color: theme.text }]}>FinTrack Pro</Text>
          <Text style={[styles.tagline, { color: theme.textMuted }]}>
            {mode === 'signin' ? 'Welcome back. Sign in to continue.' : 'Create your free account.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(600)} style={styles.form}>
          {mode === 'signup' && (
            <Input
              label="Full name"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: '' })); }}
              placeholder="Jane Doe"
              autoCapitalize="words"
              leftIcon="person"
              error={errors.name}
            />
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon="mail"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '' })); }}
            placeholder="••••••••"
            secureTextEntry={!showPw}
            leftIcon="lock-closed"
            error={errors.password}
            rightIcon={showPw ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPw((s) => !s)}
          />

          {mode === 'signup' && password.length > 0 ? (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBars}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          i < strength.score ? strength.color : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          ) : null}

          <Button
            title={mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={submit}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
          />

          {biometricsAvailable?.available && biometricsAvailable?.enrolled ? (
            <Button
              title="Use Face ID / Touch ID"
              onPress={tryBiometrics}
              variant="outline"
              icon="finger-print"
              fullWidth
              style={{ marginTop: 12 }}
            />
          ) : null}

          <Pressable
            onPress={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrors({});
            }}
            style={styles.switchRow}
          >
            <Text style={[styles.switchText, { color: theme.textMuted }]}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={[styles.legal, { color: theme.textMuted }]}>
            🔒 Your data is encrypted and stored only on this device.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBlob: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
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
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    gap: 4,
  },
  strengthWrap: {
    marginTop: 4,
    marginBottom: 12,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  switchRow: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  switchText: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  legal: {
    fontSize: 12,
    textAlign: 'center',
  },
});