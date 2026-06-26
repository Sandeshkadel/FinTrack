import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme, ThemeMode } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { authService } from '@/services/authService';
import { exportService } from '@/services/exportService';
import { notificationsService } from '@/services/notificationsService';
import type { CurrencySymbol, ThemeMode as TM } from '@/types';

interface Props {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
}

const CURRENCIES: { code: CurrencySymbol; sym: string; label: string }[] = [
  { code: '$', sym: '$', label: 'US Dollar' },
  { code: '€', sym: '€', label: 'Euro' },
  { code: '£', sym: '£', label: 'British Pound' },
  { code: '¥', sym: '¥', label: 'Japanese Yen' },
  { code: '₹', sym: '₹', label: 'Indian Rupee' },
];

const THEMES: { key: TM; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'system', label: 'System', icon: 'phone-portrait' },
  { key: 'light', label: 'Light', icon: 'sunny' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
];

export function SettingsScreen({ onBack, onNavigate, onSignOut }: Props) {
  const theme = useAppTheme();
  const { user, updateProfile, showToast, incomes, expenses, goals, budgets } = useApp();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [biometricsHwAvailable, setBiometricsHwAvailable] = useState(false);

  // Resolve biometric availability async so we don't call a Promise as `disabled` prop
  useEffect(() => {
    let mounted = true;
    authService.isBiometricsAvailable().then((v) => {
      if (mounted) setBiometricsHwAvailable(!!v?.available && !!v?.enrolled);
    }).catch(() => {
      if (mounted) setBiometricsHwAvailable(false);
    });
    return () => { mounted = false; };
  }, []);

  const setTheme = async (mode: TM) => {
    await updateProfile({ theme: mode });
  };

  const setCurrency = async (sym: CurrencySymbol) => {
    await updateProfile({ currency: sym, symbol: sym });
  };

  const setBiometrics = async (enabled: boolean) => {
    if (enabled) {
      // Toggling on — first prove the user can actually use the device's biometric.
      // Otherwise we'd flip the preference on, but the next launch would silently
      // fail to authenticate and the user would be locked out.
      try {
        const avail = await authService.isBiometricsAvailable();
        if (!avail?.available || !avail?.enrolled) {
          showToast({
            type: 'danger',
            icon: 'finger-print',
            title: 'Biometrics unavailable',
            desc: 'Set up Face ID, Touch ID, or a screen lock in your device settings first.',
          });
          return;
        }
        const res = await authService.authenticateWithBiometrics({
          promptMessage: 'Confirm to enable biometric sign-in',
        });
        if (!res.success) {
          showToast({
            type: 'warning',
            icon: 'finger-print',
            title: 'Biometric check failed',
            desc: 'Try again — make sure Face ID, Touch ID, or your device passcode works.',
          });
          return;
        }
      } catch (err) {
        showToast({ type: 'danger', icon: 'alert-circle', title: (err as Error).message });
        return;
      }
    }
    await updateProfile({ biometricsEnabled: enabled });
    showToast({
      type: 'success',
      icon: enabled ? 'lock-closed' : 'lock-open',
      title: enabled ? 'Biometric sign-in enabled' : 'Biometric sign-in disabled',
      desc: enabled
        ? 'You will be asked to authenticate every time you open FinTrack Pro.'
        : 'The lock screen will no longer appear on launch.',
    });
  };

  const testNotification = async () => {
    try {
      const granted = await notificationsService.requestPermission();
      if (!granted) {
        showToast({ type: 'danger', icon: 'bell-off', title: 'Notifications permission denied' });
        return;
      }
      await notificationsService.scheduleBudgetAlert('Test budget', 85);
      showToast({ type: 'success', icon: 'notifications', title: 'Test notification scheduled', desc: 'You will see it in 5 seconds' });
    } catch (err) {
      showToast({ type: 'danger', icon: 'alert-circle', title: (err as Error).message });
    }
  };

  const onExport = async () => {
    try {
      await exportService.exportCSV({ incomes, expenses, currency: user?.currency || ('$' as CurrencySymbol), symbol: user?.symbol || '$' });
    } catch (err) {
      Alert.alert('Export failed', (err as Error).message);
    }
  };

  const onWipe = async () => {
    setBusy(true);
    try {
      await authService.deleteAccount();
      showToast({ type: 'success', icon: 'trash', title: 'Account deleted' });
      onSignOut();
    } catch (err) {
      Alert.alert('Failed', (err as Error).message);
    } finally {
      setBusy(false);
      setConfirmWipe(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* PROFILE */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Pressable onPress={() => onNavigate('Profile')}>
            <Card style={styles.profileCard}>
              <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.profileName, { color: theme.text }]}>{user?.name || 'Your account'}</Text>
                <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{user?.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </Card>
          </Pressable>
        </Animated.View>

        {/* THEME */}
        <Section title="Appearance">
          <Card>
            <View style={styles.themeRow}>
              {THEMES.map((t) => {
                const active = (user?.theme || 'system') === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setTheme(t.key)}
                    style={[
                      styles.themePill,
                      { backgroundColor: active ? COLORS.primary : theme.input },
                    ]}
                  >
                    <Ionicons name={t.icon} size={18} color={active ? '#fff' : theme.text} />
                    <Text style={[styles.themeText, { color: active ? '#fff' : theme.text }]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </Section>

        {/* CURRENCY */}
        <Section title="Currency">
          <Card>
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((c) => {
                const active = user?.currency === c.code;
                return (
                  <Pressable
                    key={c.code}
                    onPress={() => setCurrency(c.code)}
                    style={[
                      styles.currencyPill,
                      {
                        backgroundColor: active ? COLORS.primary + '22' : 'transparent',
                        borderColor: active ? COLORS.primary : theme.inputBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.currencySym, { color: active ? COLORS.primary : theme.text }]}>
                      {c.sym}
                    </Text>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={[styles.currencyCode, { color: theme.text }]}>{c.code}</Text>
                      <Text style={[styles.currencyLabel, { color: theme.textMuted }]}>{c.label}</Text>
                    </View>
                    {active ? <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={{ marginLeft: 'auto' }} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </Section>

        {/* SECURITY */}
        <Section title="Security">
          <Card>
            <Toggle
              icon="finger-print"
              label="Biometric sign-in"
              description="Use Face ID, Touch ID, or device PIN to unlock"
              value={!!user?.biometricsEnabled}
              onValueChange={setBiometrics}
              disabled={!biometricsHwAvailable}
            />
          </Card>
        </Section>

        {/* NOTIFICATIONS */}
        <Section title="Notifications">
          <Card>
            <Button title="Send a test notification" onPress={testNotification} variant="outline" icon="notifications" fullWidth />
            <Text style={[styles.helper, { color: theme.textMuted }]}>
              Budget alerts, savings reminders, and monthly summaries run on-device only — your data never leaves this phone.
            </Text>
          </Card>
        </Section>

        {/* DATA */}
        <Section title="Data">
          <Card style={{ gap: 10 }}>
            <Button title="Export as CSV" onPress={onExport} icon="download" variant="outline" fullWidth />
            <Button title="View Reports" onPress={() => onNavigate('Reports')} icon="bar-chart" variant="outline" fullWidth />
          </Card>
        </Section>

        {/* ABOUT */}
        <Section title="About">
          <Card style={{ gap: 12 }}>
            <Row label="Version" value="2.0.4" />
            <Row label="Build" value="Expo SDK 51" />
            <Row label="Storage" value="100% on-device" />
            <Row label="Made with" value="💜 for your finances" />
          </Card>
        </Section>

        {/* DANGER ZONE */}
        <Section title="Account">
          <Card style={{ gap: 10 }}>
            <Button title="Sign out" onPress={() => setConfirmSignOut(true)} variant="outline" icon="log-out" fullWidth />
            <Button title="Delete account & all data" onPress={() => setConfirmWipe(true)} variant="danger" icon="trash" fullWidth loading={busy} />
          </Card>
        </Section>

        <Text style={[styles.legal, { color: theme.textMuted }]}>
          © 2026 FinTrack Pro · Built for iOS, Android, iPad & Tablets
        </Text>
      </ScrollView>

      <ConfirmSheet
        title="Delete your account?"
        message="This will permanently remove your account and all data from this device. This cannot be undone."
        confirmText="Delete forever"
        danger
        visible={confirmWipe}
        onConfirm={onWipe}
        onCancel={() => setConfirmWipe(false)}
      />

      <ConfirmSheet
        title="Sign out?"
        message="You can sign back in any time."
        confirmText="Sign out"
        visible={confirmSignOut}
        onConfirm={() => { setConfirmSignOut(false); onSignOut(); }}
        onCancel={() => setConfirmSignOut(false)}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Toggle({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.toggle}>
      <View style={[styles.toggleIcon, { backgroundColor: COLORS.primary + '22' }]}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{label}</Text>
        {description ? <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#e5e7eb', true: COLORS.primary + '88' }}
        thumbColor={value ? COLORS.primary : '#f4f3f4'}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 12,
  },
  back: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },

  profileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileName: { fontSize: 17, fontWeight: '800' },
  profileEmail: { fontSize: 13, marginTop: 2 },

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },

  themeRow: { flexDirection: 'row', gap: 8 },
  themePill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  themeText: { fontSize: 13, fontWeight: '700' },

  currencyGrid: { gap: 6 },
  currencyPill: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5 },
  currencySym: { fontSize: 22, fontWeight: '800', width: 36, textAlign: 'center' },
  currencyCode: { fontSize: 14, fontWeight: '800' },
  currencyLabel: { fontSize: 11, marginTop: 1 },

  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: 14, fontWeight: '700' },
  toggleDesc: { fontSize: 11, marginTop: 1 },

  helper: { fontSize: 11, marginTop: 10, lineHeight: 16 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '800' },

  legal: { fontSize: 11, textAlign: 'center', marginTop: 30 },
});