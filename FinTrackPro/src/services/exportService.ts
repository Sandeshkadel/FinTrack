import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Budget, Expense, Goal, Income } from '@/types';

export const exportService = {
  buildCSV(incomes: Income[], expenses: Expense[], currency: string): string {
    const rows: string[][] = [
      ['Date', 'Type', 'Category', 'Amount', 'Description'],
    ];
    incomes.forEach((i) => {
      if (!i) return;
      rows.push([
        i.date || '',
        'Income',
        i.category || '',
        String(i.amount ?? 0),
        i.source || '',
      ]);
    });
    expenses.forEach((e) => {
      if (!e) return;
      rows.push([
        e.date || '',
        'Expense',
        e.category || '',
        String(e.amount ?? 0),
        e.description || '',
      ]);
    });
    // Guard against undefined first-column values from legacy/migrated records —
    // String(a) avoids the "Cannot read property 'localeCompare' of undefined" throw.
    rows.sort((a, b) => String(a[0] ?? '').localeCompare(String(b[0] ?? '')));

    const escape = (s: string) => {
      if (s == null) return '';
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    return rows.map((r) => r.map(escape).join(',')).join('\n');
  },

  async exportCSV(payload: {
    incomes: Income[];
    expenses: Expense[];
    currency: string;
    symbol?: string;
  }): Promise<void> {
    const csv = this.buildCSV(payload.incomes, payload.expenses, payload.currency);
    const filename = `fintrack_report_${new Date().toISOString().split('T')[0]}.csv`;
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: 'utf8' });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
    }
  },

  async exportJSON(payload: {
    incomes: Income[];
    expenses: Expense[];
    goals: Goal[];
    budgets: Budget[];
  }): Promise<void> {
    const json = JSON.stringify(
      { ...payload, exportedAt: new Date().toISOString() },
      null,
      2,
    );
    const filename = `fintrack_data_${new Date().toISOString().split('T')[0]}.json`;
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, json, { encoding: 'utf8' });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export data' });
    }
  },
};