import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, CATEGORY_COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { formatCurrency } from '@/utils/finance';

interface Props {
  onBack: () => void;
}

export function InsightsScreen({ onBack }: Props) {
  const theme = useAppTheme();
  const { incomes, expenses, budgets, goals, user } = useApp();

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  const insights = useMemo(() => {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const prev30 = new Date(now.getTime() - 60 * 24 * 3600 * 1000);
    const inLast30 = expenses.filter((e) => new Date(e.date) >= last30);
    const inPrev30 = expenses.filter((e) => new Date(e.date) >= prev30 && new Date(e.date) < last30);
    const last30Total = inLast30.reduce((s, e) => s + e.amount, 0);
    const prev30Total = inPrev30.reduce((s, e) => s + e.amount, 0);
    const trend = prev30Total > 0 ? ((last30Total - prev30Total) / prev30Total) * 100 : 0;

    // top category
    const catTotals: Record<string, number> = {};
    inLast30.forEach((e) => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    // biggest single expense
    const biggest = [...expenses].sort((a, b) => b.amount - a.amount)[0];

    // income stability
    const incLast30 = incomes.filter((i) => new Date(i.date) >= last30).reduce((s, i) => s + i.amount, 0);
    const incPrev30 = incomes.filter((i) => new Date(i.date) >= prev30 && new Date(i.date) < last30).reduce((s, i) => s + i.amount, 0);

    // budget overruns
    const overBudgets = budgets.filter((b) => {
      const used = expenses.filter((e) => e.category === b.category).reduce((s, e) => s + e.amount, 0);
      return used > b.limit;
    }).length;

    // goal progress
    const totalGoal = goals.reduce((s, g) => s + g.target, 0);
    const totalSaved = goals.reduce((s, g) => s + g.current, 0);
    const goalPct = totalGoal > 0 ? (totalSaved / totalGoal) * 100 : 0;

    // saving streak (days with income > expense)
    const days = new Set<string>();
    [...incomes, ...expenses].forEach((r) => {
      if (!r?.date || typeof r.date !== 'string') return;
      const k = r.date.slice(0, 10);
      if (k) days.add(k);
    });
    const sortedDays = Array.from(days).sort();
    let streak = 0;
    try {
      for (let i = sortedDays.length - 1; i >= 0; i--) {
        const d = sortedDays[i];
        const dayInc = incomes
          .filter((i) => i?.date && typeof i.date === 'string' && i.date.slice(0, 10) === d)
          .reduce((s, x) => s + (x.amount || 0), 0);
        const dayExp = expenses
          .filter((e) => e?.date && typeof e.date === 'string' && e.date.slice(0, 10) === d)
          .reduce((s, x) => s + (x.amount || 0), 0);
        if (dayInc > dayExp) streak++;
        else break;
      }
    } catch {
      streak = 0;
    }

    return {
      last30Total,
      prev30Total,
      trend,
      topCat: topCat ? { key: topCat[0], total: topCat[1] } : null,
      biggest,
      incLast30,
      incPrev30,
      incTrend: incPrev30 > 0 ? ((incLast30 - incPrev30) / incPrev30) * 100 : 0,
      overBudgets,
      totalGoal,
      totalSaved,
      goalPct,
      streak,
    };
  }, [incomes, expenses, budgets, goals]);

  const catColor = (key: string) => {
    const idx = Math.abs(key.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % CATEGORY_COLORS.length;
    return CATEGORY_COLORS[idx];
  };
  const cat = insights.topCat ? { key: insights.topCat.key, color: catColor(insights.topCat.key) } : null;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Insights</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={[styles.lead, { color: theme.textMuted }]}>
          AI-powered analysis of your money habits
        </Text>

        {/* Card 1: Spending trend */}
        <Animated.View entering={FadeInDown.delay(40).duration(400)}>
          <InsightCard
            color={insights.trend > 0 ? COLORS.danger : COLORS.success}
            icon={insights.trend > 0 ? 'trending-up' : 'trending-down'}
            label="30-DAY TREND"
            title={
              insights.trend > 0
                ? `Spending up ${Math.abs(insights.trend).toFixed(0)}%`
                : `Spending down ${Math.abs(insights.trend).toFixed(0)}%`
            }
            body={
              insights.trend > 0
                ? `You spent ${formatCurrency(insights.last30Total, currency, sym)} this month, more than ${formatCurrency(insights.prev30Total, currency, sym)} last month. Consider reviewing your top categories.`
                : `You spent ${formatCurrency(insights.last30Total, currency, sym)} this month, less than ${formatCurrency(insights.prev30Total, currency, sym)} last month. Great work staying disciplined.`
            }
          />
        </Animated.View>

        {/* Card 2: Top category */}
        {insights.topCat && cat ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <InsightCard
              color={cat.color}
              icon="flame"
              label="TOP CATEGORY"
              title={`${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)} is your #1 expense`}
              body={`You spent ${formatCurrency(insights.topCat.total, currency, sym)} on ${cat.key.toLowerCase()} in the last 30 days. That's ${((insights.topCat.total / Math.max(1, insights.last30Total)) * 100).toFixed(0)}% of your total spending.`}
            />
          </Animated.View>
        ) : null}

        {/* Card 3: Biggest single expense */}
        {insights.biggest ? (
          <Animated.View entering={FadeInDown.delay(160).duration(400)}>
            <InsightCard
              color={COLORS.accent}
              icon="alert-circle"
              label="BIGGEST TRANSACTION"
              title={insights.biggest?.description || 'Largest expense'}
              body={`Your largest recent expense was ${formatCurrency(insights.biggest?.amount || 0, currency, sym)} for ${insights.biggest?.description || 'your biggest spend'}. Make sure it fits your monthly plan.`}
            />
          </Animated.View>
        ) : null}

        {/* Card 4: Goal progress */}
        {insights.totalGoal > 0 ? (
          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <Card style={styles.goalCard}>
              <View style={styles.goalHead}>
                <View style={[styles.iconBubble, { backgroundColor: COLORS.primary + '22' }]}>
                  <Ionicons name="trophy" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.goalLabel, { color: theme.textMuted }]}>GOAL PROGRESS</Text>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>
                    {formatCurrency(insights.totalSaved, currency, sym)} of {formatCurrency(insights.totalGoal, currency, sym)}
                  </Text>
                </View>
                <Text style={[styles.goalPct, { color: COLORS.primary }]}>{insights.goalPct.toFixed(0)}%</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <ProgressBar value={insights.totalSaved} max={insights.totalGoal} height={10} color={COLORS.primary} />
              </View>
              <Text style={[styles.goalBody, { color: theme.textMuted }]}>
                {insights.goalPct >= 100
                  ? '🎉 All goals complete! Time to set new ambitions.'
                  : insights.goalPct >= 75
                  ? 'Almost there — keep the momentum going.'
                  : insights.goalPct >= 50
                  ? 'Halfway there. Stay consistent.'
                  : `You're ${insights.goalPct.toFixed(0)}% of the way to your savings goals.`}
              </Text>
            </Card>
          </Animated.View>
        ) : null}

        {/* Card 5: Budget health */}
        <Animated.View entering={FadeInDown.delay(280).duration(400)}>
          <InsightCard
            color={insights.overBudgets > 0 ? COLORS.danger : COLORS.success}
            icon="pie-chart"
            label="BUDGET HEALTH"
            title={
              insights.overBudgets === 0
                ? 'All budgets under control'
                : `${insights.overBudgets} budget${insights.overBudgets === 1 ? '' : 's'} over limit`
            }
            body={
              insights.overBudgets === 0
                ? 'You stayed within every budget this month. That\'s the kind of discipline that compounds.'
                : 'Some budgets need attention. Review them in the Budgets tab and adjust if needed.'
            }
          />
        </Animated.View>

        {/* Card 6: Streak */}
        {insights.streak > 0 ? (
          <Animated.View entering={FadeInDown.delay(340).duration(400)}>
            <InsightCard
              color="#f59e0b"
              icon="flame"
              label="SAVINGS STREAK"
              title={`${insights.streak}-day streak! 🔥`}
              body={`You've earned more than you spent for ${insights.streak} days in a row. Keep the streak alive — every day counts.`}
            />
          </Animated.View>
        ) : null}

        {/* Card 7: Income trend */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <InsightCard
            color={insights.incTrend >= 0 ? COLORS.success : '#f59e0b'}
            icon={insights.incTrend >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
            label="INCOME TREND"
            title={
              insights.incTrend >= 0
                ? `Income up ${insights.incTrend.toFixed(0)}% vs last month`
                : `Income down ${Math.abs(insights.incTrend).toFixed(0)}% vs last month`
            }
            body={`You earned ${formatCurrency(insights.incLast30, currency, sym)} this month, compared to ${formatCurrency(insights.incPrev30, currency, sym)} last month.`}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function InsightCard({
  color,
  icon,
  label,
  title,
  body,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  title: string;
  body: string;
}) {
  const theme = useAppTheme();
  return (
    <Card style={styles.insightCard}>
      <View style={styles.cardHead}>
        <View style={[styles.iconBubble, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.cardLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.cardBody, { color: theme.textMuted }]}>{body}</Text>
    </Card>
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

  lead: { fontSize: 13, paddingHorizontal: 16, marginBottom: 10 },

  insightCard: { marginHorizontal: 16, marginTop: 12, padding: 18 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  cardTitle: { fontSize: 17, fontWeight: '800', marginTop: 10, letterSpacing: -0.2 },
  cardBody: { fontSize: 13, marginTop: 6, lineHeight: 20 },

  goalCard: { marginHorizontal: 16, marginTop: 12, padding: 18 },
  goalHead: { flexDirection: 'row', alignItems: 'center' },
  goalLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  goalTitle: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  goalPct: { fontSize: 24, fontWeight: '900' },
  goalBody: { fontSize: 13, marginTop: 12, lineHeight: 20 },
});