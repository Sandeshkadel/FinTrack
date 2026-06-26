import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDate } from '@/utils/finance';

interface Props {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

type Filter = 'all' | 'income' | 'expense';

export function SearchScreen({ onBack, onNavigate }: Props) {
  const theme = useAppTheme();
  const { incomes, expenses, user } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const list: any[] = [];
    if (filter !== 'expense') {
      incomes
        .filter((i) =>
          (i.source || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q) ||
          (i.description || '').toLowerCase().includes(q),
        )
        .forEach((i) => list.push({ ...i, _type: 'income' }));
    }
    if (filter !== 'income') {
      expenses
        .filter((e) =>
          (e.description || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q) ||
          (e.notes || '').toLowerCase().includes(q),
        )
        .forEach((e) => list.push({ ...e, _type: 'expense' }));
    }
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [query, filter, incomes, expenses]);

  const total = results.reduce((s, r) => s + r.amount, 0);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search transactions..."
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text }]}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterPill,
              { backgroundColor: filter === f ? COLORS.primary : theme.card },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.textMuted }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {query.trim().length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search" size={56} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Quick search</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Type to find any income or expense by title, category, or notes.
            </Text>
            <View style={styles.tipRow}>
              {['salary', 'food', 'rent', 'subscription'].map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setQuery(t)}
                  style={[styles.tip, { backgroundColor: theme.card, borderColor: theme.inputBorder }]}
                >
                  <Text style={[styles.tipText, { color: theme.textMuted }]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="sad-outline" size={56} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No matches</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Try a different search term or change the filter.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.inputBorder }]}>
              <Text style={[styles.summaryCount, { color: theme.textMuted }]}>
                {results.length} result{results.length === 1 ? '' : 's'}
              </Text>
              <Text style={[styles.summaryTotal, { color: theme.text }]}>
                {formatCurrency(total, currency, sym)}
              </Text>
            </View>
            {results.map((r) => (
              <Card key={r.id} style={styles.row}>
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: (r._type === 'income' ? COLORS.success : COLORS.danger) + '22' },
                  ]}
                >
                  <Ionicons
                    name={r._type === 'income' ? 'trending-up' : 'trending-down'}
                    size={18}
                    color={r._type === 'income' ? COLORS.success : COLORS.danger}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {r.title || (r._type === 'income' ? (r.source || 'Income') : (r.description || 'Expense'))}
                  </Text>
                  <View style={styles.meta}>
                    {r.category ? (
                      <Badge
                        label={r.category}
                        color={r._type === 'income' ? COLORS.success : COLORS.danger}
                      />
                    ) : null}
                    {r.date ? (
                      <Text style={[styles.date, { color: theme.textMuted }]}>{formatDate(r.date)}</Text>
                    ) : null}
                  </View>
                  {r.notes ? (
                    <Text style={[styles.notes, { color: theme.textMuted }]} numberOfLines={2}>
                      {r.notes}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: r._type === 'income' ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {r._type === 'income' ? '+' : '-'}
                  {formatCurrency(r.amount || 0, currency, sym)}
                </Text>
              </Card>
            ))}
          </>
        )}
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
    gap: 10,
  },
  back: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15 },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  filterText: { fontSize: 12, fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  tip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  tipText: { fontSize: 12, fontWeight: '600' },

  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  summaryCount: { fontSize: 12, fontWeight: '600' },
  summaryTotal: { fontSize: 18, fontWeight: '900' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  date: { fontSize: 11, fontWeight: '500' },
  notes: { fontSize: 11, marginTop: 4, lineHeight: 16 },
  amount: { fontSize: 14, fontWeight: '800' },
});