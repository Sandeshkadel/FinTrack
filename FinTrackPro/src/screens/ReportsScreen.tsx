import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, CATEGORY_COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { BarChart } from '@/components/BarChart';
import { DonutChart } from '@/components/DonutChart';
import { formatCurrency } from '@/utils/finance';
import { exportService } from '@/services/exportService';
import type { ReportRange } from '@/types';

function colorFor(key: string): string {
  const sum = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CATEGORY_COLORS[Math.abs(sum) % CATEGORY_COLORS.length];
}

interface Props {
  onBack: () => void;
}

const RANGES: { key: ReportRange; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export function ReportsScreen({ onBack }: Props) {
  const theme = useAppTheme();
  const { incomes, expenses, user, goals, budgets } = useApp();
  const [range, setRange] = useState<ReportRange>('monthly');
  const [exporting, setExporting] = useState(false);

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  const data = useMemo(() => {
    const now = new Date();
    const cutoff = (() => {
      if (range === 'daily') return new Date(now.getTime() - 24 * 3600 * 1000);
      if (range === 'weekly') return new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      if (range === 'monthly') return new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return new Date(now.getTime() - 365 * 24 * 3600 * 1000);
    })();
    const inRange = (d: string) => new Date(d) >= cutoff;
    const inc = incomes.filter((i) => inRange(i.date)).reduce((s, i) => s + i.amount, 0);
    const exp = expenses.filter((e) => inRange(e.date)).reduce((s, e) => s + e.amount, 0);
    const incCount = incomes.filter((i) => inRange(i.date)).length;
    const expCount = expenses.filter((e) => inRange(e.date)).length;
    const avgDaily = exp / Math.max(1, Math.ceil((now.getTime() - cutoff.getTime()) / 86400000));
    return { inc, exp, net: inc - exp, incCount, expCount, avgDaily, savingsRate: inc > 0 ? ((inc - exp) / inc) * 100 : 0 };
  }, [range, incomes, expenses]);

  const categoryBreakdown = useMemo(() => {
    const now = new Date();
    const cutoff = (() => {
      if (range === 'daily') return new Date(now.getTime() - 24 * 3600 * 1000);
      if (range === 'weekly') return new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      if (range === 'monthly') return new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return new Date(now.getTime() - 365 * 24 * 3600 * 1000);
    })();
    const expFiltered = expenses.filter((e) => new Date(e.date) >= cutoff);
    const totals: Record<string, number> = {};
    expFiltered.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals)
      .map(([cat, val]) => ({
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: val,
        color: colorFor(cat),
      }))
      .sort((a, b) => b.value - a.value);
  }, [range, expenses]);

  const barData = useMemo(() => {
    return [
      { label: 'Income', value: data.inc, color: COLORS.success },
      { label: 'Expense', value: data.exp, color: COLORS.danger },
      { label: 'Net', value: data.net, color: COLORS.primary },
    ];
  }, [data]);

  const topCategory = categoryBreakdown[0];
  const burn = data.expCount > 0 ? data.exp / data.expCount : 0;

  const onExportCSV = async () => {
    setExporting(true);
    try {
      await exportService.exportCSV({ incomes, expenses, currency, symbol: sym });
    } catch (err) {
      Alert.alert('Export failed', (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const onExportJSON = async () => {
    setExporting(true);
    try {
      await exportService.exportJSON({ incomes, expenses, goals, budgets });
    } catch (err) {
      Alert.alert('Export failed', (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Reports</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* RANGE PICKER */}
        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => setRange(r.key)}
              style={[
                styles.rangePill,
                { backgroundColor: range === r.key ? COLORS.primary : theme.card },
              ]}
            >
              <Text
                style={[
                  styles.rangeText,
                  { color: range === r.key ? '#fff' : theme.textMuted },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* HEADLINE METRICS */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card style={styles.headline}>
            <View style={styles.headlineRow}>
              <View>
                <Text style={[styles.headlineLabel, { color: theme.textMuted }]}>Net Cash Flow</Text>
                <Text style={[styles.headlineValue, { color: data.net >= 0 ? COLORS.success : COLORS.danger }]}>
                  {formatCurrency(data.net, currency, sym)}
                </Text>
              </View>
              <View style={styles.savingsBubble}>
                <Text style={styles.savingsLabel}>Savings</Text>
                <Text style={styles.savingsValue}>{data.savingsRate.toFixed(0)}%</Text>
              </View>
            </View>
            <View style={styles.headlineGrid}>
              <Metric label="Income" value={formatCurrency(data.inc, currency, sym)} color={COLORS.success} />
              <Metric label="Expenses" value={formatCurrency(data.exp, currency, sym)} color={COLORS.danger} />
              <Metric label="Transactions" value={`${data.incCount + data.expCount}`} color={COLORS.primary} />
              <Metric label="Avg / day" value={formatCurrency(data.avgDaily, currency, sym)} color="#f59e0b" />
            </View>
          </Card>
        </Animated.View>

        {/* INCOME vs EXPENSE BAR */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Card style={{ marginTop: 12 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Income vs Expenses</Text>
            <BarChart data={barData} height={180} />
          </Card>
        </Animated.View>

        {/* CATEGORY BREAKDOWN */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <Card style={{ marginTop: 12 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Spending by Category</Text>
            {categoryBreakdown.length > 0 ? (
              <>
                <DonutChart
                  labels={categoryBreakdown.map((c) => c.label)}
                  data={categoryBreakdown.map((c) => c.value)}
                  size={180}
                  currency={sym}
                />
                <View style={{ marginTop: 12, gap: 6 }}>
                  {categoryBreakdown.map((c) => (
                    <View key={c.label} style={styles.catRow}>
                      <View style={[styles.catDot, { backgroundColor: c.color }]} />
                      <Text style={[styles.catName, { color: theme.text }]}>{c.label}</Text>
                      <Text style={[styles.catPct, { color: theme.textMuted }]}>
                        {((c.value / Math.max(1, data.exp)) * 100).toFixed(0)}%
                      </Text>
                      <Text style={[styles.catValue, { color: theme.text }]}>
                        {formatCurrency(c.value, currency, sym)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={[styles.empty, { color: theme.textMuted }]}>
                No expenses in this period.
              </Text>
            )}
          </Card>
        </Animated.View>

        {/* INSIGHT TILES */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.insightGrid}>
            {topCategory ? (
              <View style={[styles.insightCard, { backgroundColor: COLORS.accent + '22' }]}>
                <Ionicons name="flame" size={22} color={COLORS.accent} />
                <Text style={[styles.insightLabel, { color: COLORS.accent }]}>Top Category</Text>
                <Text style={[styles.insightValue, { color: theme.text }]}>{topCategory.label}</Text>
                <Text style={[styles.insightSub, { color: theme.textMuted }]}>
                  {formatCurrency(topCategory.value, currency, sym)}
                </Text>
              </View>
            ) : null}
            <View style={[styles.insightCard, { backgroundColor: COLORS.success + '22' }]}>
              <Ionicons name="receipt" size={22} color={COLORS.success} />
              <Text style={[styles.insightLabel, { color: COLORS.success }]}>Avg Transaction</Text>
              <Text style={[styles.insightValue, { color: theme.text }]}>
                {formatCurrency(burn, currency, sym)}
              </Text>
              <Text style={[styles.insightSub, { color: theme.textMuted }]}>
                {data.expCount} expenses
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* EXPORT */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <Card style={{ marginTop: 12 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Export Data</Text>
            <Text style={[styles.exportSub, { color: theme.textMuted }]}>
              Share your data as CSV (Excel / Numbers) or JSON (backup).
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button title="CSV" onPress={onExportCSV} icon="download" loading={exporting} style={{ flex: 1 }} />
              <Button title="JSON" onPress={onExportJSON} icon="code-slash" variant="outline" loading={exporting} style={{ flex: 1 }} />
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
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
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },

  rangeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 8 },
  rangePill: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  rangeText: { fontSize: 12, fontWeight: '700' },

  headline: { marginHorizontal: 16, marginTop: 6, padding: 16 },
  headlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headlineLabel: { fontSize: 12, fontWeight: '600' },
  headlineValue: { fontSize: 32, fontWeight: '900', marginTop: 2, letterSpacing: -0.8 },
  savingsBubble: { backgroundColor: COLORS.success + '22', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  savingsLabel: { fontSize: 10, fontWeight: '700', color: COLORS.success, letterSpacing: 0.6 },
  savingsValue: { fontSize: 22, fontWeight: '900', color: COLORS.success },

  headlineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '48%' },
  metricDot: { width: 8, height: 8, borderRadius: 4 },
  metricLabel: { fontSize: 10, fontWeight: '600', color: '#6b7280' },
  metricValue: { fontSize: 14, fontWeight: '800', color: '#111827' },

  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  empty: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 13, fontWeight: '600' },
  catPct: { fontSize: 12, fontWeight: '600' },
  catValue: { fontSize: 13, fontWeight: '800', minWidth: 90, textAlign: 'right' },

  insightGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  insightCard: { flex: 1, padding: 14, borderRadius: 16 },
  insightLabel: { fontSize: 11, fontWeight: '700', marginTop: 6, letterSpacing: 0.4 },
  insightValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  insightSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  exportSub: { fontSize: 12, marginTop: 2, lineHeight: 18 },
});