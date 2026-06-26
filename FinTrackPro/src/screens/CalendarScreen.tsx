import React, { useMemo, useState } from 'react';
import {
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
import { Badge } from '@/components/Badge';
import { formatCurrency } from '@/utils/finance';

interface Props {
  onBack: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarScreen({ onBack }: Props) {
  const theme = useAppTheme();
  const { incomes, expenses, user } = useApp();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(
    new Date().toISOString().slice(0, 10),
  );

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const days: ({ day: number; iso: string } | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, iso });
    }
    return days;
  }, [cursor]);

  const dayIndex = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    incomes.forEach((i) => {
      const k = i.date.slice(0, 10);
      if (!map[k]) map[k] = { income: 0, expense: 0 };
      map[k].income += i.amount;
    });
    expenses.forEach((e) => {
      const k = e.date.slice(0, 10);
      if (!map[k]) map[k] = { income: 0, expense: 0 };
      map[k].expense += e.amount;
    });
    return map;
  }, [incomes, expenses]);

  const monthSummary = useMemo(() => {
    const ym = cursor.toISOString().slice(0, 7);
    const inc = incomes.filter((i) => i.date.startsWith(ym)).reduce((s, i) => s + i.amount, 0);
    const exp = expenses.filter((e) => e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
    return { inc, exp, net: inc - exp };
  }, [cursor, incomes, expenses]);

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const items: any[] = [];
    incomes
      .filter((i) => i.date.slice(0, 10) === selectedDay)
      .forEach((i) => items.push({ ...i, _type: 'income' }));
    expenses
      .filter((e) => e.date.slice(0, 10) === selectedDay)
      .forEach((e) => items.push({ ...e, _type: 'expense' }));
    return items.sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedDay, incomes, expenses]);

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => {
    setCursor(new Date());
    setSelectedDay(new Date().toISOString().slice(0, 10));
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
        <Pressable onPress={goToday} hitSlop={10} style={[styles.today, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.todayText}>Today</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <SummaryTile label="Income" value={monthSummary.inc} color={COLORS.success} currency={currency} sym={sym} />
          <SummaryTile label="Expenses" value={monthSummary.exp} color={COLORS.danger} currency={currency} sym={sym} />
          <SummaryTile label="Net" value={monthSummary.net} color={COLORS.primary} currency={currency} sym={sym} />
        </View>

        {/* Calendar card */}
        <Card style={styles.calCard}>
          <View style={styles.monthRow}>
            <Pressable onPress={goPrev} hitSlop={10} style={styles.monthBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </Pressable>
            <Text style={[styles.monthLabel, { color: theme.text }]}>{monthLabel}</Text>
            <Pressable onPress={goNext} hitSlop={10} style={styles.monthBtn}>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.weekdays}>
            {WEEKDAYS.map((w, i) => (
              <Text key={i} style={[styles.weekday, { color: theme.textMuted }]}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {grid.map((cell, i) => {
              if (!cell) return <View key={i} style={styles.cell} />;
              const data = dayIndex[cell.iso];
              const has = !!data && (data.income > 0 || data.expense > 0);
              const isSel = cell.iso === selectedDay;
              const isToday = cell.iso === todayIso;
              return (
                <Pressable
                  key={cell.iso}
                  onPress={() => setSelectedDay(cell.iso)}
                  style={[
                    styles.cell,
                    isSel && { backgroundColor: COLORS.primary },
                    isToday && !isSel && { borderColor: COLORS.primary, borderWidth: 1.5 },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { color: isSel ? '#fff' : theme.text },
                      isToday && !isSel && { color: COLORS.primary, fontWeight: '800' },
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {has ? (
                    <View style={styles.cellDots}>
                      {data.income > 0 ? <View style={[styles.dot, { backgroundColor: isSel ? '#fff' : COLORS.success }]} /> : null}
                      {data.expense > 0 ? <View style={[styles.dot, { backgroundColor: isSel ? '#fff' : COLORS.danger }]} /> : null}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: COLORS.success }]} /><Text style={[styles.legendText, { color: theme.textMuted }]}>Income</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: COLORS.danger }]} /><Text style={[styles.legendText, { color: theme.textMuted }]}>Expense</Text></View>
          </View>
        </Card>

        {/* Day detail */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.dayTitle, { color: theme.text }]}>
            {selectedDay
              ? new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              : 'Pick a day'}
          </Text>
          {dayEvents.length === 0 ? (
            <Card>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Nothing recorded on this day.
              </Text>
            </Card>
          ) : (
            dayEvents.map((ev) => (
              <Card key={ev.id} style={styles.eventRow}>
                <View
                  style={[
                    styles.eventDot,
                    { backgroundColor: ev._type === 'income' ? COLORS.success : COLORS.danger },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventTitle, { color: theme.text }]}>{ev.title}</Text>
                  <View style={styles.eventMeta}>
                    <Badge
                      label={ev.category}
                      color={ev._type === 'income' ? COLORS.success : COLORS.danger}
                    />
                    <Text style={[styles.eventDate, { color: theme.textMuted }]}>{ev.notes}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.eventAmt,
                    { color: ev._type === 'income' ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {ev._type === 'income' ? '+' : '-'}
                  {formatCurrency(ev.amount, currency, sym)}
                </Text>
              </Card>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function SummaryTile({ label, value, color, currency, sym }: { label: string; value: number; color: string; currency: string; sym: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: color + '22' }]}>
      <Text style={[styles.tileLabel, { color }]}>{label}</Text>
      <Text style={[styles.tileValue, { color }]}>{formatCurrency(value, currency, sym)}</Text>
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
  today: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  todayText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 8 },
  tile: { flex: 1, padding: 12, borderRadius: 14 },
  tileLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  tileValue: { fontSize: 14, fontWeight: '800', marginTop: 4 },

  calCard: { marginHorizontal: 16, marginTop: 4 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthBtn: { padding: 6 },
  monthLabel: { fontSize: 17, fontWeight: '800' },
  weekdays: { flexDirection: 'row', marginBottom: 6 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 4,
  },
  cellText: { fontSize: 14, fontWeight: '600' },
  cellDots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 11, fontWeight: '600' },

  dayTitle: { fontSize: 17, fontWeight: '800', marginHorizontal: 16, marginTop: 18, marginBottom: 10, letterSpacing: -0.2 },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 18 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 8 },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  eventTitle: { fontSize: 14, fontWeight: '700' },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  eventDate: { fontSize: 11, fontWeight: '500' },
  eventAmt: { fontSize: 14, fontWeight: '800' },
});
