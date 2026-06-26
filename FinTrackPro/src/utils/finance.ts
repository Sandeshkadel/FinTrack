/**
 * Format a number with currency symbol and locale-friendly separators.
 * Mirrors the formatting in the web version: $1,234.56
 *
 * @param amount  Number to format (can be negative).
 * @param symbol  Currency symbol to prepend (e.g. '$', '€', '₹'). Defaults to '$'.
 * @param code    Optional ISO currency code — accepted for API parity with the
 *                web app; not used in the formatted string.
 */
export function formatCurrency(
  amount: number,
  symbol: string = '$',
  code?: string,
): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${symbol}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a number without currency symbol.
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Animate a number from start to end over duration.
 * Returns a cleanup function.
 */
export function animateNumber(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
): () => void {
  const start = Date.now();
  let frame: number;

  const update = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(1, elapsed / duration);
    // Cubic ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (to - from) * eased;
    onUpdate(current);
    if (progress < 1) {
      frame = requestAnimationFrame(update);
    } else {
      onUpdate(to);
      onComplete?.();
    }
  };

  frame = requestAnimationFrame(update);
  return () => cancelAnimationFrame(frame);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date as YYYY-MM-DD using local time (not UTC).
 */
export function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date at local midnight.
 */
export function fromLocalDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Escape HTML/special characters for safe rendering.
 */
export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c] ?? c;
  });
}

/**
 * Generate a unique-ish id.
 */
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  );
}

/**
 * Group an array of items by a key.
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  arr.forEach((item) => {
    const k = keyFn(item);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  });
  return out;
}

/**
 * Compute financial health score (0-100) using the same formula as the web.
 */
export interface HealthReport {
  score: number;
  grade: string;
  message: string;
  netWorth: number;
  savingsRate: number;
  streak: number;
  monthIncome: number;
  monthExpense: number;
  incomeTrend: number;
  expenseTrend: number;
  goalsCompleted: number;
  goalsTotal: number;
  budgetsActive: number;
  budgetsOver: number;
  achievementsUnlocked: number;
}

/**
 * Compute financial health score (0-100) using the same formula as the web.
 * Returns a rich report used by the Dashboard hero card and stat tiles.
 */
export function calculateHealth(args: {
  totalIncome: number;
  totalExpense: number;
  recentIncomeCount: number;
  budgets: { category: string; limit: number }[];
  expenses: { category: string; amount: number; date: string }[];
  goals: { target: number; current: number }[];
  prevMonthIncome?: number;
  prevMonthExpense?: number;
  streak?: number;
  achievementsUnlocked?: number;
}): HealthReport {
  const {
    totalIncome,
    totalExpense,
    recentIncomeCount,
    budgets,
    expenses,
    goals,
    prevMonthIncome = 0,
    prevMonthExpense = 0,
    streak = 0,
    achievementsUnlocked = 0,
  } = args;

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const incomeStability = Math.min(1, recentIncomeCount / 3);

  let budgetScore = 1;
  let budgetsOver = 0;
  budgets.forEach((b) => {
    const used = expenses
      .filter((e) => e.category === b.category)
      .reduce((s, e) => s + e.amount, 0);
    if (used > b.limit) {
      budgetScore *= 0.5;
      budgetsOver++;
    } else if (used > b.limit * 0.8) {
      budgetScore *= 0.8;
    }
  });

  let goalProgress = 0;
  let goalsCompleted = 0;
  goals.forEach((g) => {
    if (g.target > 0) {
      goalProgress += g.current / g.target;
      if (g.current >= g.target) goalsCompleted++;
    }
  });
  goalProgress = goals.length > 0 ? Math.min(1, goalProgress / goals.length) : 0.5;

  const expenseRatio = totalIncome > 0 ? Math.min(1, totalExpense / totalIncome) : 1;
  const expenseScore = 1 - Math.min(1, expenseRatio * 1.2);

  const score = Math.round(
    (savingsRate / 100 * 0.25 +
      incomeStability * 0.2 +
      budgetScore * 0.2 +
      goalProgress * 0.2 +
      expenseScore * 0.15) *
      100,
  );

  const finalScore = Math.min(100, Math.max(0, score));
  const grade =
    finalScore >= 90 ? 'A+' :
    finalScore >= 80 ? 'A' :
    finalScore >= 70 ? 'B' :
    finalScore >= 60 ? 'C' :
    finalScore >= 50 ? 'D' : 'F';

  const message =
    finalScore >= 80 ? 'Excellent — keep it up!' :
    finalScore >= 60 ? 'Good — room to optimize.' :
    finalScore >= 40 ? 'Building momentum.' :
    'Time to take control.';

  const incomeTrend = prevMonthIncome > 0
    ? ((totalIncome - prevMonthIncome) / prevMonthIncome) * 100
    : 0;
  const expenseTrend = prevMonthExpense > 0
    ? ((totalExpense - prevMonthExpense) / prevMonthExpense) * 100
    : 0;

  return {
    score: finalScore,
    grade,
    message,
    netWorth: totalIncome - totalExpense,
    savingsRate,
    streak,
    monthIncome: totalIncome,
    monthExpense: totalExpense,
    incomeTrend,
    expenseTrend,
    goalsCompleted,
    goalsTotal: goals.length,
    budgetsActive: budgets.length,
    budgetsOver,
    achievementsUnlocked,
  };
}

/**
 * Compute upcoming bills (expenses dated within next 7 days).
 */
export function getUpcomingBills<T extends { date: string }>(
  expenses: T[],
  window: number = 7,
): T[] {
  const now = new Date();
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= window;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Compute recent activity combining incomes and expenses.
 */
export function getRecentActivity<T extends { date: string }>(
  incomes: T[],
  expenses: T[],
  limit: number = 6,
): Array<T & { type: 'income' | 'expense' }> {
  const all: Array<T & { type: 'income' | 'expense' }> = [
    ...(incomes.map((i) => ({ ...i, type: 'income' as const })) as Array<T & { type: 'income' | 'expense' }>),
    ...(expenses.map((e) => ({ ...e, type: 'expense' as const })) as Array<T & { type: 'income' | 'expense' }>),
  ];
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return all.slice(0, limit);
}

/**
 * Compute chart data for the income vs expense line chart.
 */
export function getChartData(
  incomes: { amount: number; date: string }[],
  expenses: { amount: number; date: string }[],
  range: 'week' | 'month' | '6m' | 'year' | 'all',
): { labels: string[]; incomeData: number[]; expenseData: number[]; totalIncome: number; totalExpense: number } {
  const now = new Date();
  let labels: string[] = [];
  const incomeData: number[] = [];
  const expenseData: number[] = [];

  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const ds = toLocalDateString(d);
      incomeData.push(incomes.filter((i) => i.date === ds).reduce((s, i) => s + i.amount, 0));
      expenseData.push(expenses.filter((e) => e.date === ds).reduce((s, e) => s + e.amount, 0));
    }
  } else if (range === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      labels.push(String(i));
      const d = new Date(year, month, i);
      const ds = toLocalDateString(d);
      incomeData.push(incomes.filter((inc) => inc.date === ds).reduce((s, inc) => s + inc.amount, 0));
      expenseData.push(expenses.filter((exp) => exp.date === ds).reduce((s, exp) => s + exp.amount, 0));
    }
  } else if (range === 'year') {
    for (let i = 0; i < 12; i++) {
      const m = new Date(now.getFullYear(), i, 1);
      labels.push(m.toLocaleDateString('en-US', { month: 'short' }));
      const start = new Date(now.getFullYear(), i, 1);
      const end = new Date(now.getFullYear(), i + 1, 0);
      let inc = 0;
      let exp = 0;
      incomes.forEach((item) => {
        const d = new Date(item.date);
        if (d >= start && d <= end) inc += item.amount;
      });
      expenses.forEach((item) => {
        const d = new Date(item.date);
        if (d >= start && d <= end) exp += item.amount;
      });
      incomeData.push(inc);
      expenseData.push(exp);
    }
  } else if (range === '6m') {
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(m.toLocaleDateString('en-US', { month: 'short' }));
      const s = new Date(m.getFullYear(), m.getMonth(), 1);
      const e = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      let inc = 0;
      let exp = 0;
      incomes.forEach((item) => {
        const d = new Date(item.date);
        if (d >= s && d <= e) inc += item.amount;
      });
      expenses.forEach((item) => {
        const d = new Date(item.date);
        if (d >= s && d <= e) exp += item.amount;
      });
      incomeData.push(inc);
      expenseData.push(exp);
    }
  } else {
    // 'all' — bucket by year-month
    const buckets = new Map<string, { inc: number; exp: number }>();
    const all = [...incomes.map((i) => ({ ...i, type: 'income' as const })), ...expenses.map((e) => ({ ...e, type: 'expense' as const }))];
    all.forEach((item) => {
      if (!item.date) return;
      const key = item.date.slice(0, 7);
      if (!buckets.has(key)) buckets.set(key, { inc: 0, exp: 0 });
      const b = buckets.get(key)!;
      if (item.type === 'income') b.inc += item.amount;
      else b.exp += item.amount;
    });
    const sortedKeys = Array.from(buckets.keys()).sort();
    sortedKeys.forEach((key) => {
      const [y, m] = key.split('-');
      labels.push(
        new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
      );
      const b = buckets.get(key)!;
      incomeData.push(b.inc);
      expenseData.push(b.exp);
    });
  }

  return { labels, incomeData, expenseData, totalIncome: incomeData.reduce((s, n) => s + n, 0), totalExpense: expenseData.reduce((s, n) => s + n, 0) };
}

/**
 * Compute expense categories breakdown for the doughnut chart.
 */
export function getExpenseCategoryData(
  expenses: { amount: number; date: string; category?: string }[],
  range: 'week' | 'month' | '6m' | 'year' | 'all' = 'month',
): { segments: { label: string; value: number; color: string }[]; total: number } {
  const now = new Date();
  const start = new Date(now);
  if (range === 'week') start.setDate(now.getDate() - 7);
  else if (range === 'month') start.setMonth(now.getMonth() - 1);
  else if (range === '6m') start.setMonth(now.getMonth() - 6);
  else if (range === 'year') start.setFullYear(now.getFullYear() - 1);
  else start.setFullYear(2000, 0, 1);

  // Color palette mirrors the CATEGORY_COLORS in /constants/colors.ts
  const palette = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#a855f7', '#f43f5e', '#3b82f6', '#84cc16', '#f97316', '#14b8a6', '#6366f1'];

  const categories: Record<string, number> = {};
  expenses.forEach((e) => {
    const d = new Date(e.date);
    if (d >= start) {
      const cat = e.category || 'Other';
      categories[cat] = (categories[cat] || 0) + e.amount;
    }
  });

  const total = Object.values(categories).reduce((s, n) => s + n, 0);
  const segments = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value,
      color: palette[i % palette.length],
    }));

  return { segments, total };
}

/**
 * Compute budget usage for the bar chart.
 */
export function getBudgetUsageData(
  budgets: { category: string; limit: number }[],
  expenses: { category: string; amount: number; date: string }[],
): { labels: string[]; used: number[]; limits: number[] } {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    labels: budgets.map((b) => b.category),
    used: budgets.map((b) =>
      expenses
        .filter((e) => e.category === b.category && new Date(e.date) >= monthStart)
        .reduce((s, e) => s + e.amount, 0),
    ),
    limits: budgets.map((b) => b.limit),
  };
}

/**
 * Compute savings growth series for the line chart.
 */
export function getSavingsData(
  range: 'week' | 'month' | '6m' | 'year' | 'all',
  incomes: { amount: number; date: string }[],
  expenses: { amount: number; date: string }[],
): { labels: string[]; data: number[] } {
  const now = new Date();
  const start = new Date(now);
  if (range === 'week') start.setDate(now.getDate() - 7);
  else if (range === 'month') start.setMonth(now.getMonth() - 1);
  else if (range === 'year') start.setFullYear(now.getFullYear() - 1);
  else if (range === 'all') start.setFullYear(2000, 0, 1);
  else start.setMonth(now.getMonth() - 6);

  const useMonthly = range === '6m' || range === 'year' || range === 'all';
  const buckets: Record<string, number> = {};
  const all = [
    ...incomes.map((i) => ({ ...i, type: 'income' as const })),
    ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
  ];
  all.forEach((item) => {
    const d = new Date(item.date);
    if (d >= start) {
      const key = useMonthly ? item.date.slice(0, 7) : item.date;
      if (!buckets[key]) buckets[key] = 0;
      buckets[key] += item.type === 'income' ? item.amount : -item.amount;
    }
  });

  const sortedKeys = Object.keys(buckets).sort();
  let running = 0;
  const labels: string[] = [];
  const data: number[] = [];
  sortedKeys.forEach((key) => {
    running += buckets[key];
    labels.push(key);
    data.push(running);
  });

  return { labels, data };
}