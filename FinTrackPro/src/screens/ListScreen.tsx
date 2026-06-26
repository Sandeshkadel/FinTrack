import React, { useState, useMemo, useRef } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS, CATEGORY_COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { FormSheet } from '@/components/FormSheet';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { ImageGallery } from '@/components/ImageGallery';
import { imageService } from '@/services/imageService';
import { ocrService } from '@/services/ocrService';
import { formatCurrency, formatDate } from '@/utils/finance';
import type { Expense, Income, Goal, Budget } from '@/types';

function colorFor(key: string): string {
  const sum = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CATEGORY_COLORS[Math.abs(sum) % CATEGORY_COLORS.length];
}

type Kind = 'income' | 'expense' | 'goal' | 'budget';

interface Props {
  kind: Kind;
  onBack: () => void;
}

const KIND_META: Record<
  Kind,
  {
    title: string;
    addLabel: string;
    empty: string;
    emptyIcon: keyof typeof Ionicons.glyphMap;
    color: string;
    totalLabel: string;
  }
> = {
  income: {
    title: 'Income',
    addLabel: 'Add Income',
    empty: 'No income recorded yet.\nTap “Add Income” to start tracking your earnings.',
    emptyIcon: 'trending-up',
    color: COLORS.success,
    totalLabel: 'Total Income',
  },
  expense: {
    title: 'Expenses',
    addLabel: 'Add Expense',
    empty: 'No expenses recorded yet.\nTap “Add Expense” to start tracking your spending.',
    emptyIcon: 'trending-down',
    color: COLORS.danger,
    totalLabel: 'Total Expenses',
  },
  goal: {
    title: 'Savings Goals',
    addLabel: 'Add Goal',
    empty: 'No goals yet.\nSet a savings goal and watch your progress grow.',
    emptyIcon: 'trophy',
    color: COLORS.accent,
    totalLabel: 'Total Saved',
  },
  budget: {
    title: 'Budgets',
    addLabel: 'Add Budget',
    empty: 'No budgets yet.\nSet monthly limits to keep your spending in check.',
    emptyIcon: 'pie-chart',
    color: '#f59e0b',
    totalLabel: 'Total Limit',
  },
};

export function ListScreen({ kind, onBack }: Props) {
  const theme = useAppTheme();
  const {
    incomes,
    expenses,
    goals,
    budgets,
    upsertIncome,
    deleteIncome,
    upsertExpense,
    deleteExpense,
    upsertGoal,
    deleteGoal,
    upsertBudget,
    deleteBudget,
    user,
  } = useApp();
  const meta = KIND_META[kind];

  const currency = user?.currency || 'USD';
  const sym = user?.symbol || '$';

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const sheetRef = useRef<any>(null);
  const confirmRef = useRef<any>(null);

  const items = useMemo(() => {
    let list: any[] = [];
    if (kind === 'income') list = incomes;
    else if (kind === 'expense') list = expenses;
    else if (kind === 'goal') list = goals;
    else list = budgets;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((it) => (it.title || it.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [kind, incomes, expenses, goals, budgets, search]);

  const total = useMemo(() => {
    if (kind === 'goal') return goals.reduce((s, g) => s + g.current, 0);
    if (kind === 'budget') return budgets.reduce((s, b) => s + b.limit, 0);
    return items.reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
  }, [items, kind, goals, budgets]);

  const openAdd = () => {
    setEditingId(null);
    sheetRef.current?.open();
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    sheetRef.current?.open();
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    if (kind === 'income') await deleteIncome(confirmId);
    else if (kind === 'expense') await deleteExpense(confirmId);
    else if (kind === 'goal') await deleteGoal(confirmId);
    else await deleteBudget(confirmId);
    setConfirmId(null);
  };

  const editingItem = useMemo(() => {
    if (!editingId) return null;
    if (kind === 'income') return incomes.find((i) => i.id === editingId);
    if (kind === 'expense') return expenses.find((i) => i.id === editingId);
    if (kind === 'goal') return goals.find((i) => i.id === editingId);
    return budgets.find((i) => i.id === editingId);
  }, [editingId, kind, incomes, expenses, goals, budgets]);

  const handleSave = async (data: any) => {
    if (kind === 'income') {
      const rec: Income = {
        id: editingId || `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        source: data.title,
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        description: data.notes,
        images: data.images || [],
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        createdTime: (editingItem as any)?.createdTime || new Date().toISOString(),
      };
      await upsertIncome(rec);
    } else if (kind === 'expense') {
      const rec: Expense = {
        id: editingId || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        description: data.title,
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        notes: data.notes,
        images: data.images || [],
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        createdTime: (editingItem as any)?.createdTime || new Date().toISOString(),
      };
      await upsertExpense(rec);
    } else if (kind === 'goal') {
      const rec: Goal = {
        id: editingId || `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: data.title,
        target: Number(data.amount),
        current: Number(data.current || 0),
        deadline: data.date,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        createdTime: (editingItem as any)?.createdTime || new Date().toISOString(),
      };
      await upsertGoal(rec);
    } else {
      const rec: Budget = {
        id: editingId || `bud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        category: data.category,
        limit: Number(data.amount),
        period: data.period || 'monthly',
        createdAt: editingItem?.createdAt || new Date().toISOString(),
      };
      await upsertBudget(rec);
    }
    sheetRef.current?.close();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={[styles.back, { backgroundColor: theme.card }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.title, { color: theme.text }]}>{meta.title}</Text>
          <Text style={[styles.total, { color: theme.textMuted }]}>
            {meta.totalLabel}: {formatCurrency(total, currency, sym)}
          </Text>
        </View>
        <Button title={meta.addLabel} onPress={openAdd} size="sm" icon="add" />
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={16} color={theme.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${meta.title.toLowerCase()}...`}
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
            <ListItem
              kind={kind}
              item={item}
              onEdit={() => openEdit(item.id)}
              onDelete={() => setConfirmId(item.id)}
              currency={currency}
              sym={sym}
              expenses={expenses}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name={meta.emptyIcon} size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>{meta.empty}</Text>
            <Button title={meta.addLabel} onPress={openAdd} style={{ marginTop: 18 }} icon="add" />
          </View>
        }
      />

      <RecordSheet
        ref={sheetRef}
        kind={kind}
        editing={editingItem}
        onSave={handleSave}
        expenses={expenses}
      />

      <ConfirmSheet
        ref={confirmRef}
        title={`Delete this ${kind}?`}
        message="This cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
        visible={confirmId !== null}
      />
    </View>
  );
}

function ListItem({
  kind,
  item,
  onEdit,
  onDelete,
  currency,
  sym,
  expenses,
}: {
  kind: Kind;
  item: any;
  onEdit: () => void;
  onDelete: () => void;
  currency: string;
  sym: string;
  expenses: Expense[];
}) {
  const theme = useAppTheme();

  if (kind === 'income' || kind === 'expense') {
    const catColor = colorFor(item.category);
    const sign = kind === 'income' ? '+' : '-';
    return (
      <Pressable onPress={onEdit}>
        <Card style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: catColor + '22' }]}>
            <Ionicons
              name={kind === 'income' ? 'trending-up' : 'trending-down'}
              size={18}
              color={catColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.rowMeta}>
              <Badge label={item.category} color={catColor} />
              <Text style={[styles.rowDate, { color: theme.textMuted }]}>{formatDate(item.date)}</Text>
            </View>
          </View>
          <Text
            style={[
              styles.amount,
              { color: kind === 'income' ? COLORS.success : COLORS.danger },
            ]}
          >
            {sign}
            {formatCurrency(item.amount, currency, sym)}
          </Text>
        </Card>
      </Pressable>
    );
  }

  if (kind === 'goal') {
    const pct = item.target > 0 ? Math.min(100, (item.current / item.target) * 100) : 0;
    return (
      <Pressable onPress={onEdit}>
        <Card>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: (item.color || COLORS.primary) + '22' }]}>
              <Text style={{ fontSize: 20 }}>{item.icon || '🎯'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.rowDate, { color: theme.textMuted }]}>
                {formatCurrency(item.current, currency, sym)} of {formatCurrency(item.target, currency, sym)}
              </Text>
            </View>
            <Text style={[styles.amount, { color: item.color || COLORS.primary }]}>
              {pct.toFixed(0)}%
            </Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <ProgressBar value={item.current} max={item.target} height={8} color={item.color || COLORS.primary} />
          </View>
        </Card>
      </Pressable>
    );
  }

  // budget
  const used = expenses
    .filter((e) => e.category === item.category)
    .reduce((s, e) => s + e.amount, 0);
  const pct = item.limit > 0 ? Math.min(100, (used / item.limit) * 100) : 0;
  return (
    <Pressable onPress={onEdit}>
      <Card>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '22' }]}>
            <Ionicons name="pie-chart" size={18} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.rowDate, { color: theme.textMuted }]}>
              {formatCurrency(used, currency, sym)} of {formatCurrency(item.limit, currency, sym)}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              { color: pct >= 100 ? COLORS.danger : pct >= 80 ? '#f59e0b' : COLORS.success },
            ]}
          >
            {pct.toFixed(0)}%
          </Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <ProgressBar
            value={used}
            max={item.limit}
            height={8}
            color={pct >= 100 ? COLORS.danger : pct >= 80 ? '#f59e0b' : COLORS.primary}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const RecordSheet = React.forwardRef<any, {
  kind: Kind;
  editing: any;
  onSave: (data: any) => void;
  expenses: Expense[];
}>(({ kind, editing, onSave }, ref) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [current, setCurrent] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState(COLORS.primary);
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [images, setImages] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const sheetRef = useRef<any>(null);

  React.useEffect(() => {
    if (editing) {
      setTitle(editing.title || editing.name || '');
      setAmount(String(editing.amount ?? editing.target ?? ''));
      setCurrent(String(editing.current ?? ''));
      setCategory(editing.category || 'other');
      setDate(editing.date || editing.deadline || new Date().toISOString().slice(0, 10));
      setNotes(editing.notes || '');
      setIcon(editing.icon || '🎯');
      setColor(editing.color || COLORS.primary);
      setPeriod(editing.period || 'monthly');
      setImages(editing.images || []);
    } else {
      setTitle('');
      setAmount('');
      setCurrent('');
      setCategory(kind === 'income' ? 'salary' : kind === 'budget' ? 'food' : 'food');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setIcon('🎯');
      setColor(COLORS.primary);
      setPeriod('monthly');
      setImages([]);
    }
  }, [editing, kind]);

  React.useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  const pickImages = async () => {
    try {
      const imgs = await imageService.pickFromLibrary(8 - images.length);
      setImages((p) => [...p, ...imgs]);
    } catch (err) {
      Alert.alert('Could not add images', (err as Error).message);
    }
  };

  const takePhoto = async () => {
    try {
      const img = await imageService.takePhoto();
      if (img) setImages((p) => [...p, img]);
    } catch (err) {
      Alert.alert('Camera unavailable', (err as Error).message);
    }
  };

  const scanReceipt = async () => {
    setScanning(true);
    try {
      const result = await ocrService.scanReceipt();
      if (result) {
        if (result.amount) setAmount(String(result.amount));
        if (result.description) setTitle(result.description);
        if (result.date) setDate(result.date);
        Alert.alert('Receipt scanned!', 'Fields have been pre-filled. Review and save.');
      } else {
        Alert.alert('Scan cancelled', 'No receipt data was extracted.');
      }
    } catch (err) {
      Alert.alert('Scan failed', (err as Error).message);
    } finally {
      setScanning(false);
    }
  };

  const submit = () => {
    if (!title.trim()) return Alert.alert('Title required', 'Please enter a title.');
    const amt = Number(amount);
    if (!amt || amt <= 0) return Alert.alert('Amount required', 'Please enter a valid amount.');
    onSave({ title: title.trim(), amount: amt, current: Number(current || 0), category, date, notes, images, icon, color, period });
  };

  const isIncome = kind === 'income';
  const isExpense = kind === 'expense';
  const isGoal = kind === 'goal';
  const isBudget = kind === 'budget';

  const categories = (isIncome
    ? ['salary', 'freelance', 'investment', 'business', 'gift', 'other']
    : isBudget
    ? ['food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'education', 'other']
    : ['food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'education', 'other']);

  return (
    <FormSheet ref={sheetRef} snapPoints={['85%']}>
      <Text style={sheetStyles.h}>{editing ? 'Edit' : 'New'} {KIND_META[kind].title.replace(/s$/, '')}</Text>

      {isExpense ? (
        <Button title="📸 Scan Receipt with OCR" onPress={scanReceipt} loading={scanning} variant="outline" fullWidth style={{ marginBottom: 14 }} />
      ) : null}

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Salary, Groceries..." />

      <View style={sheetStyles.row}>
        <View style={{ flex: 1 }}>
          <Input
            label={isGoal ? 'Target amount' : 'Amount'}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon="cash"
          />
        </View>
        {isGoal ? (
          <View style={{ flex: 1 }}>
            <Input
              label="Current saved"
              value={current}
              onChangeText={setCurrent}
              placeholder="0.00"
              keyboardType="decimal-pad"
              leftIcon="wallet"
            />
          </View>
        ) : null}
      </View>

      <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" leftIcon="calendar" />

      <Text style={sheetStyles.lbl}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sheetStyles.chips}>
        {categories.map((c) => {
          const color = colorFor(c);
          const active = category === c;
          return (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[
                sheetStyles.chip,
                { backgroundColor: active ? color : 'rgba(0,0,0,0.05)' },
                active && { borderColor: color },
              ]}
            >
              <Text style={[sheetStyles.chipText, { color: active ? '#fff' : '#374151' }]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isGoal ? (
        <>
          <Text style={sheetStyles.lbl}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sheetStyles.chips}>
            {['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💰', '🏖️', '🎮', '📱'].map((e) => (
              <Pressable
                key={e}
                onPress={() => setIcon(e)}
                style={[sheetStyles.iconChip, icon === e && { backgroundColor: COLORS.primary }]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      {isBudget ? (
        <>
          <Text style={sheetStyles.lbl}>Period</Text>
          <View style={sheetStyles.periodRow}>
            {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[sheetStyles.chip, { backgroundColor: period === p ? COLORS.primary : 'rgba(0,0,0,0.05)' }]}
              >
                <Text style={[sheetStyles.chipText, { color: period === p ? '#fff' : '#374151' }]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {(isIncome || isExpense) ? (
        <>
          <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Add notes..." multiline numberOfLines={3} />
          <Text style={sheetStyles.lbl}>Attachments (up to 8)</Text>
          <ImageGallery
            images={images}
            onRemove={(i) => setImages((p) => p.filter((_, idx) => idx !== i))}
            onAdd={() => {
              Alert.alert('Add images', 'Choose a source', [
                { text: 'Camera', onPress: takePhoto },
                { text: 'Library', onPress: pickImages },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            max={8}
          />
        </>
      ) : null}

      <Button title={editing ? 'Save changes' : `Add ${KIND_META[kind].addLabel.replace('Add ', '')}`} onPress={submit} fullWidth size="lg" style={{ marginTop: 18 }} />
    </FormSheet>
  );
});

RecordSheet.displayName = 'RecordSheet';

const sheetStyles = StyleSheet.create({
  h: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 14, letterSpacing: -0.3 },
  row: { flexDirection: 'row', gap: 10 },
  lbl: { fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 8, marginBottom: 8, letterSpacing: 0.3 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent' },
  chipText: { fontSize: 12, fontWeight: '700' },
  iconChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 8,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  total: { fontSize: 12, marginTop: 2 },

  searchWrap: { paddingHorizontal: 16, marginBottom: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14 },

  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  rowDate: { fontSize: 11, fontWeight: '500' },
  amount: { fontSize: 15, fontWeight: '800' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 30 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 20 },
});