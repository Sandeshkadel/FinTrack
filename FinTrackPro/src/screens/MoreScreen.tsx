import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { formatCurrency } from '@/utils/finance';

interface Props {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onOpenSearch: () => void;
}

export function MoreScreen({ onBack, onNavigate, onOpenSearch }: Props) {
  const theme = useAppTheme();
  const { user, healthReport } = useApp();

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  const tiles = [
    { key: 'Insights', icon: 'sparkles', color: COLORS.primary, label: 'Insights', desc: 'Personalized analysis' },
    { key: 'Reports', icon: 'bar-chart', color: COLORS.accent, label: 'Reports', desc: 'Daily · Weekly · Monthly · Yearly' },
    { key: 'Calendar', icon: 'calendar', color: '#f59e0b', label: 'Calendar', desc: 'See activity by day' },
    { key: 'Search', icon: 'search', color: COLORS.success, label: 'Quick Search', desc: 'Find any transaction' },
    { key: 'Profile', icon: 'person-circle', color: '#06b6d4', label: 'Profile', desc: 'Avatar, name, achievements' },
    { key: 'Settings', icon: 'settings', color: '#a855f7', label: 'Settings', desc: 'Theme, currency, security' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>More</Text>
        <Pressable onPress={onOpenSearch} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={18} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.grid}>
          {tiles.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => {
                if (t.key === 'Search') onOpenSearch();
                else onNavigate(t.key);
              }}
              style={[styles.tile, { backgroundColor: theme.card, borderColor: theme.inputBorder }]}
            >
              <View style={[styles.tileIcon, { backgroundColor: t.color + '22' }]}>
                <Ionicons name={t.icon as any} size={26} color={t.color} />
              </View>
              <Text style={[styles.tileLabel, { color: theme.text }]}>{t.label}</Text>
              <Text style={[styles.tileDesc, { color: theme.textMuted }]}>{t.desc}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.statsCard}>
          <Text style={[styles.statsTitle, { color: theme.textMuted }]}>THIS MONTH</Text>
          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={[styles.statsLabel, { color: COLORS.success }]}>Income</Text>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {formatCurrency(healthReport?.monthIncome || 0, currency, sym)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statsItem}>
              <Text style={[styles.statsLabel, { color: COLORS.danger }]}>Spent</Text>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {formatCurrency(healthReport?.monthExpense || 0, currency, sym)}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.legal, { color: theme.textMuted }]}>
          FinTrack Pro v2.0.0 · Made with 💜
        </Text>
      </ScrollView>
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

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginTop: 8 },
  tile: {
    width: '48%',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  tileIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tileLabel: { fontSize: 16, fontWeight: '800' },
  tileDesc: { fontSize: 12, marginTop: 3 },

  statsCard: { marginHorizontal: 16, marginTop: 16 },
  statsTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.1)' },
  statsLabel: { fontSize: 11, fontWeight: '700' },
  statsValue: { fontSize: 22, fontWeight: '900', marginTop: 4, letterSpacing: -0.4 },

  legal: { fontSize: 11, textAlign: 'center', marginTop: 30 },
});