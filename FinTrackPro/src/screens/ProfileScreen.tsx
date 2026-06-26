import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { imageService } from '@/services/imageService';
import { authService } from '@/services/authService';

interface Props {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: Props) {
  const theme = useAppTheme();
  const { user, updateProfile, showToast } = useApp();
  const [editName, setEditName] = useState(user?.name || '');
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [pwSheetOpen, setPwSheetOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);

  const pickAvatar = async () => {
    try {
      const imgs = await imageService.pickFromLibrary(1);
      if (imgs[0]) {
        await updateProfile({ avatar: imgs[0] });
        showToast({ type: 'success', icon: 'checkmark-circle', title: 'Profile photo updated' });
      }
    } catch (err) {
      Alert.alert('Could not load photo', (err as Error).message);
    }
  };

  const saveName = async () => {
    if (editName.trim().length < 2) return Alert.alert('Name too short', 'Use at least 2 characters.');
    await updateProfile({ name: editName.trim() });
    setEditSheetOpen(false);
    showToast({ type: 'success', icon: 'person', title: 'Name updated' });
  };

  const changePassword = async () => {
    if (!user) return;
    if (newPw.length < 6) return Alert.alert('Too short', 'New password must be at least 6 characters.');
    setBusy(true);
    try {
      await authService.changePassword(user.id, oldPw, newPw);
      setOldPw('');
      setNewPw('');
      setPwSheetOpen(false);
      showToast({ type: 'success', icon: 'lock-open', title: 'Password changed' });
    } catch (err) {
      Alert.alert('Failed', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const signOutEverywhere = async () => {
    Alert.alert(
      'Sign out of all devices?',
      'This will clear all sessions for this account on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await authService.endSession();
            showToast({ type: 'success', icon: 'log-out', title: 'Signed out' });
          },
        },
      ],
    );
  };

  if (!user) return null;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* AVATAR */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <View style={styles.avatarWrap}>
              <Pressable onPress={pickAvatar} style={styles.avatarTouch}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={[styles.cameraBubble, { backgroundColor: COLORS.primary, borderColor: theme.bg }]}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </Pressable>
              <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user.email}</Text>
              {user.createdAt ? (
                <Text style={[styles.userSince, { color: theme.textMuted }]}>
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              ) : null}
            </View>
          </Animated.View>

          {/* ACCOUNT INFO */}
          <Section title="Account">
            <Card style={{ gap: 4 }}>
              <InfoRow label="Name" value={user.name} icon="person" action={() => setEditSheetOpen(true)} />
              <InfoRow label="Email" value={user.email} icon="mail" />
              <InfoRow label="Currency" value={`${user.symbol} ${user.currency}`} icon="cash" />
              <InfoRow label="Theme" value={user.theme || 'System'} icon="color-palette" />
            </Card>
          </Section>

          {/* SECURITY */}
          <Section title="Security">
            <Card style={{ gap: 10 }}>
              <Button title="Change password" onPress={() => setPwSheetOpen(true)} variant="outline" icon="lock-closed" fullWidth />
              <Button title="Sign out of this device" onPress={signOutEverywhere} variant="outline" icon="log-out" fullWidth />
            </Card>
          </Section>

          {/* ACHIEVEMENTS */}
          <Section title="Achievements">
            <Card>
              <View style={styles.achieveGrid}>
                {[
                  { icon: 'flame', label: '7-day streak', earned: true },
                  { icon: 'trophy', label: 'First goal', earned: true },
                  { icon: 'star', label: 'Top saver', earned: false },
                  { icon: 'medal', label: 'Budget master', earned: false },
                  { icon: 'rocket', label: 'Power user', earned: false },
                  { icon: 'diamond', label: 'Pro', earned: false },
                ].map((a, i) => (
                  <View
                    key={i}
                    style={[
                      styles.achieveTile,
                      {
                        backgroundColor: a.earned ? COLORS.success + '22' : theme.input,
                        borderColor: a.earned ? COLORS.success : theme.inputBorder,
                      },
                    ]}
                  >
                    <Ionicons
                      name={a.icon as any}
                      size={22}
                      color={a.earned ? COLORS.success : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.achieveLabel,
                        { color: a.earned ? COLORS.success : theme.textMuted },
                      ]}
                    >
                      {a.label}
                    </Text>
                    {a.earned ? (
                      <Ionicons name="checkmark-circle" size={12} color={COLORS.success} style={{ position: 'absolute', top: 4, right: 4 }} />
                    ) : (
                      <Ionicons name="lock-closed" size={10} color={theme.textMuted} style={{ position: 'absolute', top: 4, right: 4 }} />
                    )}
                  </View>
                ))}
              </View>
            </Card>
          </Section>

          {/* DATA */}
          <Section title="Your Data">
            <Card>
              <Text style={[styles.dataText, { color: theme.textMuted }]}>
                All your data is stored encrypted on this device. Nothing is sent to a server. Use the export tools in Settings to back up your records.
              </Text>
            </Card>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmSheet
        title="Edit name"
        message="Update your display name"
        confirmText="Save"
        visible={editSheetOpen}
        onCancel={() => setEditSheetOpen(false)}
        onConfirm={saveName}
        customContent={
          <View style={{ marginBottom: 14 }}>
            <Input label="Full name" value={editName} onChangeText={setEditName} placeholder="Jane Doe" />
          </View>
        }
      />

      <ConfirmSheet
        title="Change password"
        message="Choose a strong password (≥6 chars)"
        confirmText="Change"
        visible={pwSheetOpen}
        onCancel={() => setPwSheetOpen(false)}
        onConfirm={changePassword}
        customContent={
          <View style={{ marginBottom: 14, gap: 10 }}>
            <Input label="Current password" value={oldPw} onChangeText={setOldPw} secureTextEntry leftIcon="lock-closed" />
            <Input label="New password" value={newPw} onChangeText={setNewPw} secureTextEntry leftIcon="lock-closed" />
          </View>
        }
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

function InfoRow({ label, value, icon, action }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; action?: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable onPress={action} style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: COLORS.primary + '22' }]}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
      {action ? <Ionicons name="chevron-forward" size={16} color={theme.textMuted} /> : null}
    </Pressable>
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

  avatarWrap: { alignItems: 'center', paddingVertical: 24 },
  avatarTouch: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 110, height: 110, borderRadius: 55 },
  avatarText: { color: '#fff', fontSize: 42, fontWeight: '800' },
  cameraBubble: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  userName: { fontSize: 22, fontWeight: '800', marginTop: 14 },
  userEmail: { fontSize: 13, marginTop: 2 },
  userSince: { fontSize: 11, marginTop: 4 },

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', marginTop: 1 },

  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveTile: { width: '31%', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  achieveLabel: { fontSize: 10, fontWeight: '700', marginTop: 6, textAlign: 'center' },

  dataText: { fontSize: 12, lineHeight: 18 },

  modalRoot: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  modalCard: { width: '88%', padding: 20, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
});