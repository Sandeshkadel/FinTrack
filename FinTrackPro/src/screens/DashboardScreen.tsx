import React, { useMemo, useState, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { LineChart } from '@/components/LineChart';
import { DonutChart } from '@/components/DonutChart';
import { BarChart } from '@/components/BarChart';
import { ProgressRing } from '@/components/ProgressRing';
import { Button } from '@/components/Button';
import {
  formatCurrency,
  getChartData,
  getExpenseCategoryData,
  getBudgetUsageData,
  getUpcomingBills,
  getRecentActivity,
} from '@/utils/finance';
import type { ChartRange } from '@/types';

const { width } = Dimensions.get('window');

const FILTERS: { label: string; value: ChartRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '6M', value: '6m' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' },
];

interface Props {
  onNavigate: (page: string) => void;
  onOpenSearch: () => void;
}

export function DashboardScreen({ onNavigate, onOpenSearch }: Props) {
  const theme = useAppTheme();
  const { user, incomes, expenses, goals, budgets, refreshHealth, healthReport } = useApp();
  const [chartRange, setChartRange] = useState<ChartRange>('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshHealth();
  }, [incomes, expenses, goals, budgets, refreshHealth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHealth();
    setRefreshing(false);
  };

  const lineData = useMemo(() => getChartData(incomes, expenses, chartRange), [incomes, expenses, chartRange]);
  const donutData = useMemo(() => getExpenseCategoryData(expenses, chartRange), [expenses, chartRange]);
  const budgetUsageRaw = useMemo(() => getBudgetUsageData(budgets, expenses), [budgets, expenses]);
  const budgetUsage = useMemo(
    () =>
      budgetUsageRaw.labels.map((label, i) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: budgetUsageRaw.limits[i] - budgetUsageRaw.used[i],
        color: budgetUsageRaw.used[i] > budgetUsageRaw.limits[i] ? COLORS.danger : COLORS.primary,
      })),
    [budgetUsageRaw],
  );
  const upcomingRaw = useMemo(() => getUpcomingBills(expenses, 7), [expenses]);
  const upcoming = useMemo(
    () =>
      upcomingRaw.map((e) => ({
        id: e.id,
        title: e.description || 'Untitled',
        amount: e.amount,
        dueLabel: new Date(e.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [upcomingRaw],
  );
  const activityRaw = useMemo(
    () => getRecentActivity<any>(incomes as any, expenses as any, 5),
    [incomes, expenses],
  );
  const activity = useMemo(
    () =>
      activityRaw.map((a) => ({
        id: a.id,
        title: a.type === 'income' ? a.source : (a as any).description || 'Untitled',
        amount: a.amount,
        type: a.type,
        dateLabel: new Date(a.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [activityRaw],
  );

  const h =
    healthReport ?? {
      score: 0,
      grade: '—',
      message: '',
      netWorth: 0,
      savingsRate: 0,
      streak: 0,
      monthIncome: 0,
      monthExpense: 0,
      incomeTrend: 0,
      expenseTrend: 0,
      goalsCompleted: 0,
      goalsTotal: 0,
      budgetsActive: 0,
      budgetsOver: 0,
      achievementsUnlocked: 0,
    };

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>
            Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>Your financial overview</Text>
        </View>
        <Pressable onPress={onOpenSearch} hitSlop={10} style={[styles.iconBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.text} />
        </Pressable>
        <Pressable onPress={() => onNavigate('Settings')} hitSlop={10} style={[styles.iconBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="settings-outline" size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* HEALTH HERO */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <Card style={[styles.heroCard, { backgroundColor: COLORS.primary }]} glow>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>FINANCIAL HEALTH</Text>
              <View style={styles.heroScoreRow}>
                <Text style={styles.heroScore}>{h.score}</Text>
                <Text style={styles.heroScoreOf}>/100</Text>
              </View>
              <Text style={styles.heroGrade}>{h.grade} • {h.message}</Text>

              <View style={styles.heroStats}>
                <HeroStat label="Net Worth" value={formatCurrency(h.netWorth, currency, sym)} />
                <HeroStat label="Savings Rate" value={`${h.savingsRate.toFixed(0)}%`} />
                <HeroStat label="Streak" value={`${h.streak}d`} />
              </View>
            </View>

            <ProgressRing
              value={h.score}
              max={100}
              size={96}
              strokeWidth={8}
              color="#fff"
              trackColor="rgba(255,255,255,0.18)"
              label={`${h.score}`}
              sublabel={h.grade}
            />
          </View>
        </Card>
      </Animated.View>

      {/* 6 STAT CARDS */}
      <Animated.View entering={FadeInDown.delay(80).duration(500)}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Stats</Text>
        <View style={styles.statGrid}>
          <StatCard
            label="Income"
            value={formatCurrency(h.monthIncome, currency, sym)}
            icon="trending-up"
            color={COLORS.success}
            trend={`+${h.incomeTrend.toFixed(0)}%`}
            trendUp={h.incomeTrend >= 0}
          />
          <StatCard
            label="Expenses"
            value={formatCurrency(h.monthExpense, currency, sym)}
            icon="trending-down"
            color={COLORS.danger}
            trend={`${h.expenseTrend >= 0 ? '+' : ''}${h.expenseTrend.toFixed(0)}%`}
            trendUp={h.expenseTrend <= 0}
          />
          <StatCard
            label="Net Savings"
            value={formatCurrency(h.monthIncome - h.monthExpense, currency, sym)}
            icon="wallet"
            color={COLORS.primary}
          />
          <StatCard
            label="Goals"
            value={`${h.goalsCompleted}/${h.goalsTotal}`}
            icon="trophy"
            color={COLORS.accent}
          />
          <StatCard
            label="Budgets"
            value={`${h.budgetsActive}`}
            icon="pie-chart"
            color="#f59e0b"
          />
          <StatCard
            label="Achievements"
            value={`${h.achievementsUnlocked}`}
            icon="medal"
            color="#06b6d4"
          />
        </View>
      </Animated.View>

      {/* CHART RANGE FILTER — shared by all 4 charts */}
      <Animated.View entering={FadeInDown.delay(140).duration(500)}>
        <View style={styles.filterRow}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
            Cash Flow
          </Text>
          <View style={[styles.filterBar, { backgroundColor: theme.card }]}>
            {FILTERS.map((f) => (
              <Pressable
                key={f.value}
                onPress={() => setChartRange(f.value)}
                style={[
                  styles.filterPill,
                  chartRange === f.value && { backgroundColor: COLORS.primary },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: chartRange === f.value ? '#fff' : theme.textMuted },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Card>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: theme.text }]}>Income vs Expenses</Text>
              <Text style={[styles.chartSub, { color: theme.textMuted }]}>
                Net: {formatCurrency(lineData.totalIncome - lineData.totalExpense, currency, sym)}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <Legend color={COLORS.success} label="Income" />
              <Legend color={COLORS.danger} label="Expense" />
            </View>
          </View>
          <LineChart
            labels={lineData.labels}
            data={{ income: lineData.incomeData, expense: lineData.expenseData }}
            height={200}
          />
        </Card>
      </Animated.View>

      {/* EXPENSE BREAKDOWN DONUT */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Card style={{ marginTop: 12 }}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Spending Breakdown</Text>
          <Text style={[styles.chartSub, { color: theme.textMuted, marginBottom: 12 }]}>
            Where your money goes
          </Text>
          {donutData.segments.length > 0 ? (
            <DonutChart
              labels={donutData.segments.map((s) => s.label)}
              data={donutData.segments.map((s) => s.value)}
              size={220}
              currency={sym}
            />
          ) : (
            <EmptyChart label="No expenses yet — add some to see your breakdown" />
          )}
        </Card>
      </Animated.View>

      {/* BUDGET USAGE BAR CHART */}
      <Animated.View entering={FadeInDown.delay(260).duration(500)}>
        <Card style={{ marginTop: 12 }}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Budget Usage</Text>
          <Text style={[styles.chartSub, { color: theme.textMuted, marginBottom: 12 }]}>
            How close you are to each budget cap
          </Text>
          {budgetUsage.length > 0 ? (
            <BarChart data={budgetUsage} height={Math.max(180, budgetUsage.length * 36)} />
          ) : (
            <EmptyChart label="No budgets yet — set one to track your limits" />
          )}
          <Pressable onPress={() => onNavigate('Budgets')} style={styles.cardLink}>
            <Text style={[styles.cardLinkText, { color: COLORS.primary }]}>Manage budgets</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </Pressable>
        </Card>
      </Animated.View>

      {/* UPCOMING BILLS */}
      <Animated.View entering={FadeInDown.delay(320).duration(500)}>
        <Card style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Upcoming Bills</Text>
            <Pressable onPress={() => onNavigate('Calendar')}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
            </Pressable>
          </View>
          {upcoming.length > 0 ? (
            upcoming.slice(0, 4).map((b) => (
              <View key={b.id} style={[styles.upcomingRow, { borderColor: theme.inputBorder }]}>
                <View style={[styles.upcomingIcon, { backgroundColor: COLORS.danger + '20' }]}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.upcomingTitle, { color: theme.text }]}>{b.title}</Text>
                  <Text style={[styles.upcomingSub, { color: theme.textMuted }]}>{b.dueLabel}</Text>
                </View>
                <Text style={[styles.upcomingAmount, { color: theme.text }]}>
                  {formatCurrency(b.amount, currency, sym)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptySmall, { color: theme.textMuted }]}>
              No upcoming bills 🎉
            </Text>
          )}
        </Card>
      </Animated.View>

      {/* RECENT ACTIVITY */}
      <Animated.View entering={FadeInDown.delay(380).duration(500)}>
        <Card style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Recent Activity</Text>
          </View>
          {activity.length > 0 ? (
            activity.map((a) => (
              <View key={a.id} style={[styles.activityRow, { borderColor: theme.inputBorder }]}>
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: a.type === 'income' ? COLORS.success : COLORS.danger },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>
                    {a.title}
                  </Text>
                  <Text style={[styles.activityDate, { color: theme.textMuted }]}>{a.dateLabel}</Text>
                </View>
                <Text
                  style={[
                    styles.activityAmount,
                    { color: a.type === 'income' ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {a.type === 'income' ? '+' : '-'}
                  {formatCurrency(a.amount, currency, sym)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptySmall, { color: theme.textMuted }]}>No recent activity</Text>
          )}
        </Card>
      </Animated.View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={styles.heroStatValue}>{value}</Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.inputBorder }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      {trend ? (
        <View style={styles.statTrend}>
          <Ionicons
            name={trendUp ? 'arrow-up' : 'arrow-down'}
            size={10}
            color={trendUp ? COLORS.success : COLORS.danger}
          />
          <Text style={[styles.statTrendText, { color: trendUp ? COLORS.success : COLORS.danger }]}>
            {trend}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function EmptyChart({ label }: { label: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.emptyChart}>
      <Ionicons name="pie-chart-outline" size={36} color={theme.textMuted} />
      <Text style={[styles.emptyChartText, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  greeting: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginBottom: 18,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  heroScoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  heroScore: { color: '#fff', fontSize: 44, fontWeight: '900', letterSpacing: -1.5 },
  heroScoreOf: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  heroGrade: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  heroStats: { flexDirection: 'row', marginTop: 18, gap: 18 },
  heroStat: {},
  heroStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  heroStatValue: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 2 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginVertical: 10, letterSpacing: -0.3 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: (width - 42) / 2,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  statValue: { fontSize: 17, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  statTrend: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  statTrendText: { fontSize: 11, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  filterText: { fontSize: 11, fontWeight: '700' },

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  chartTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  chartSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  legendRow: { flexDirection: 'row', gap: 12 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600', color: '#6b7280' },

  emptyChart: { alignItems: 'center', paddingVertical: 30 },
  emptyChartText: { marginTop: 8, fontSize: 13, textAlign: 'center' },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' },
  cardLinkText: { fontSize: 13, fontWeight: '700' },

  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  upcomingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  upcomingTitle: { fontSize: 14, fontWeight: '700' },
  upcomingSub: { fontSize: 11, marginTop: 1 },
  upcomingAmount: { fontSize: 14, fontWeight: '800' },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityTitle: { fontSize: 14, fontWeight: '600' },
  activityDate: { fontSize: 11, marginTop: 1 },
  activityAmount: { fontSize: 14, fontWeight: '800' },

  emptySmall: { fontSize: 13, paddingVertical: 12, textAlign: 'center' },
});