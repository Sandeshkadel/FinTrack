import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  Achievement,
  Budget,
  Expense,
  Goal,
  Income,
  Notification,
  Transaction,
  User,
} from '@/types';

/**
 * Storage layer — AsyncStorage for non-sensitive data, SecureStore for credentials.
 *
 * Mirrors the localStorage keys from the web version (fintrack_*) so data shapes
 * stay compatible if a user ever moves back to the web.
 */

const KEYS = {
  USER: 'fintrack_user',
  TOKEN: 'fintrack_token',
  SESSION_EXPIRY: 'fintrack_session_expiry',
  USERS: 'fintrack_users',
  INCOMES: 'fintrack_incomes',
  EXPENSES: 'fintrack_expenses',
  GOALS: 'fintrack_goals',
  BUDGETS: 'fintrack_budgets',
  TRANSACTIONS: 'fintrack_transactions',
  ACHIEVEMENTS: 'fintrack_achievements',
  NOTIFICATIONS: 'fintrack_notifications',
  HEALTH: 'fintrack_health',
  STREAK: 'fintrack_streak',
  THEME: 'fintrack_theme',
  CURRENCY: 'fintrack_currency',
  LAST_SAVE: 'fintrack_last_save',
  ONBOARDING_DONE: 'fintrack_onboarding_done',
  BIOMETRICS_ENABLED: 'fintrack_biometrics_enabled',
} as const;

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to set ${key}`, err);
  }
}

export const storage = {
  // Auth / user
  async getUser(): Promise<User | null> {
    return getJSON<User | null>(KEYS.USER, null);
  },
  async setUser(user: User | null) {
    if (user) await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    else await AsyncStorage.removeItem(KEYS.USER);
  },
  async getUsers(): Promise<User[]> {
    return getJSON<User[]>(KEYS.USERS, []);
  },
  async setUsers(users: User[]) {
    return setJSON(KEYS.USERS, users);
  },
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.TOKEN);
  },
  async setToken(token: string | null) {
    if (token) await AsyncStorage.setItem(KEYS.TOKEN, token);
    else await AsyncStorage.removeItem(KEYS.TOKEN);
  },
  async getSessionExpiry(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.SESSION_EXPIRY);
  },
  async setSessionExpiry(expiry: string | null) {
    if (expiry) await AsyncStorage.setItem(KEYS.SESSION_EXPIRY, expiry);
    else await AsyncStorage.removeItem(KEYS.SESSION_EXPIRY);
  },

  // Domain data
  async getIncomes(): Promise<Income[]> {
    return getJSON<Income[]>(KEYS.INCOMES, []);
  },
  async setIncomes(items: Income[]) {
    return setJSON(KEYS.INCOMES, items);
  },
  async getExpenses(): Promise<Expense[]> {
    return getJSON<Expense[]>(KEYS.EXPENSES, []);
  },
  async setExpenses(items: Expense[]) {
    return setJSON(KEYS.EXPENSES, items);
  },
  async getGoals(): Promise<Goal[]> {
    return getJSON<Goal[]>(KEYS.GOALS, []);
  },
  async setGoals(items: Goal[]) {
    return setJSON(KEYS.GOALS, items);
  },
  async getBudgets(): Promise<Budget[]> {
    return getJSON<Budget[]>(KEYS.BUDGETS, []);
  },
  async setBudgets(items: Budget[]) {
    return setJSON(KEYS.BUDGETS, items);
  },
  async getTransactions(): Promise<Transaction[]> {
    return getJSON<Transaction[]>(KEYS.TRANSACTIONS, []);
  },
  async setTransactions(items: Transaction[]) {
    return setJSON(KEYS.TRANSACTIONS, items);
  },
  async getAchievements(): Promise<Achievement[]> {
    const defaults: Achievement[] = [
      { id: 'first_income', name: 'First Income', icon: 'arrow-down', unlocked: false },
      { id: 'first_expense', name: 'First Expense', icon: 'arrow-up', unlocked: false },
      { id: 'budget_master', name: 'Budget Master', icon: 'pie-chart', unlocked: false },
      { id: 'goal_achiever', name: 'Goal Achiever', icon: 'bullseye', unlocked: false },
      { id: 'savings_streak', name: 'Savings Streak', icon: 'fire', unlocked: false },
      { id: 'financial_expert', name: 'Financial Expert', icon: 'star', unlocked: false },
    ];
    const list = await getJSON<Achievement[]>(KEYS.ACHIEVEMENTS, []);
    if (!list || list.length === 0) {
      await setJSON(KEYS.ACHIEVEMENTS, defaults);
      return defaults;
    }
    return list;
  },
  async setAchievements(items: Achievement[]) {
    return setJSON(KEYS.ACHIEVEMENTS, items);
  },
  async getNotifications(): Promise<Notification[]> {
    return getJSON<Notification[]>(KEYS.NOTIFICATIONS, []);
  },
  async setNotifications(items: Notification[]) {
    return setJSON(KEYS.NOTIFICATIONS, items);
  },

  // Settings
  async getHealth(): Promise<number> {
    const v = await AsyncStorage.getItem(KEYS.HEALTH);
    return v ? parseInt(v, 10) || 0 : 0;
  },
  async setHealth(score: number) {
    await AsyncStorage.setItem(KEYS.HEALTH, String(score));
  },
  async getStreak(): Promise<number> {
    const v = await AsyncStorage.getItem(KEYS.STREAK);
    return v ? parseInt(v, 10) || 0 : 0;
  },
  async setStreak(streak: number) {
    await AsyncStorage.setItem(KEYS.STREAK, String(streak));
  },
  async getLastSave(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.LAST_SAVE);
  },
  async setLastSave(date: string) {
    await AsyncStorage.setItem(KEYS.LAST_SAVE, date);
  },
  async getTheme(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.THEME)) || 'light';
  },
  async setTheme(theme: string) {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  },
  async getCurrency(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.CURRENCY)) || '$';
  },
  async setCurrency(symbol: string) {
    await AsyncStorage.setItem(KEYS.CURRENCY, symbol);
  },
  async getOnboardingDone(): Promise<boolean> {
    const v = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return v === 'true';
  },
  async setOnboardingDone(done: boolean) {
    await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, String(done));
  },
  async getBiometricsEnabled(): Promise<boolean> {
    const v = await AsyncStorage.getItem(KEYS.BIOMETRICS_ENABLED);
    return v === 'true';
  },
  async setBiometricsEnabled(enabled: boolean) {
    await AsyncStorage.setItem(KEYS.BIOMETRICS_ENABLED, String(enabled));
  },

  // Secure store helpers — for sensitive data only
  async secureGet(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async secureSet(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.warn('[SecureStore] set failed', err);
    }
  },
  async secureDelete(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },

  async wipe() {
    await AsyncStorage.clear();
  },
};