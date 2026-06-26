import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  Achievement,
  Budget,
  CurrencySymbol,
  Expense,
  Goal,
  Income,
  Notification,
  ThemeMode,
  ToastMessage,
  Transaction,
  User,
} from '@/types';
import { storage } from '@/storage/storage';
import { imageDB } from '@/database/db';
import { authService } from '@/services/authService';
import { toLocalDateString, uid, calculateHealth, HealthReport } from '@/utils/finance';

/* ============================================================
 * STATE
 * ============================================================ */

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  users: User[];

  // Domain data
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  budgets: Budget[];
  transactions: Transaction[];
  notifications: Notification[];
  achievements: Achievement[];

  // UI prefs
  theme: ThemeMode;
  currency: CurrencySymbol;
  healthScore: number;
  healthReport: HealthReport | null;
  savingsStreak: number;
  biometricsEnabled: boolean;
  onboardingDone: boolean;
  notificationsEnabled: boolean;

  // Ephemeral UI
  toasts: ToastMessage[];
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<AppState> }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_CURRENCY'; payload: CurrencySymbol }
  | { type: 'SET_INCOMES'; payload: Income[] }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'SET_HEALTH'; payload: number }
  | { type: 'SET_HEALTH_REPORT'; payload: HealthReport | null }
  | { type: 'SET_STREAK'; payload: number }
  | { type: 'SET_BIOMETRICS'; payload: boolean }
  | { type: 'SET_ONBOARDING_DONE'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS_ENABLED'; payload: boolean }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string };

const initialState: AppState = {
  user: null,
  token: null,
  users: [],
  incomes: [],
  expenses: [],
  goals: [],
  budgets: [],
  transactions: [],
  notifications: [],
  achievements: [],
  theme: 'light',
  currency: '$',
  healthScore: 0,
  healthReport: null,
  savingsStreak: 0,
  biometricsEnabled: false,
  onboardingDone: false,
  notificationsEnabled: true,
  toasts: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_INCOMES':
      return { ...state, incomes: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    case 'SET_HEALTH':
      return { ...state, healthScore: action.payload };
    case 'SET_HEALTH_REPORT':
      return { ...state, healthReport: action.payload };
    case 'SET_STREAK':
      return { ...state, savingsStreak: action.payload };
    case 'SET_BIOMETRICS':
      return { ...state, biometricsEnabled: action.payload };
    case 'SET_ONBOARDING_DONE':
      return { ...state, onboardingDone: action.payload };
    case 'SET_NOTIFICATIONS_ENABLED':
      return { ...state, notificationsEnabled: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { ...action.payload, id: action.payload.id ?? uid() }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

/* ============================================================
 * CONTEXT
 * ============================================================ */

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  showToast: (toast: ToastMessage) => void;
  addNotification: (title: string, desc: string, icon?: string) => void;
  // Convenience methods
  upsertIncome: (item: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  upsertExpense: (item: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  upsertGoal: (item: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  upsertBudget: (item: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setCurrency: (c: CurrencySymbol) => Promise<void>;
  setTheme: (t: ThemeMode) => Promise<void>;
  setBiometricsEnabled: (v: boolean) => Promise<void>;
  setNotificationsEnabled: (v: boolean) => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  signInCompleted: () => Promise<void>;
  markOnboardingDone: () => Promise<void>;
  refreshHealth: () => Promise<number>;
  checkAchievements: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ============================================================
 * PROVIDER
 * ============================================================ */

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const systemColorScheme = useColorScheme();
  const hydrationRan = useRef(false);

  /* ---------- Hydration ---------- */
  useEffect(() => {
    if (hydrationRan.current) return;
    hydrationRan.current = true;
    (async () => {
      const [
        user,
        token,
        users,
        incomes,
        expenses,
        goals,
        budgets,
        transactions,
        achievements,
        notifications,
        healthScore,
        savingsStreak,
        theme,
        currency,
        onboardingDone,
        biometricsEnabled,
      ] = await Promise.all([
        storage.getUser(),
        storage.getToken(),
        storage.getUsers(),
        storage.getIncomes(),
        storage.getExpenses(),
        storage.getGoals(),
        storage.getBudgets(),
        storage.getTransactions(),
        storage.getAchievements(),
        storage.getNotifications(),
        storage.getHealth(),
        storage.getStreak(),
        storage.getTheme(),
        storage.getCurrency(),
        storage.getOnboardingDone(),
        storage.getBiometricsEnabled(),
      ]);

      // Hydrate images for records on app start
      const allRecordIds = [
        ...incomes.map((i) => i.id),
        ...expenses.map((e) => e.id),
        ...goals.map((g) => g.id),
      ];
      const images = allRecordIds.length > 0 ? await imageDB.getAllForRecords(allRecordIds) : {};
      const withImgs = <T extends { id: string; images?: string[] }>(arr: T[]): T[] =>
        arr.map((it) => ({ ...it, images: images[it.id] ?? it.images ?? [] }));

      dispatch({
        type: 'HYDRATE',
        payload: {
          user,
          token,
          users,
          incomes: withImgs(incomes),
          expenses: withImgs(expenses),
          goals: withImgs(goals),
          budgets,
          transactions,
          achievements,
          notifications,
          healthScore,
          savingsStreak,
          theme: (theme as ThemeMode) || 'light',
          currency: (currency as CurrencySymbol) || '$',
          onboardingDone,
          biometricsEnabled,
        },
      });
    })();
  }, []);

  /* ---------- Apply theme to system ---------- */
  useEffect(() => {
    // effective theme handled by useAppTheme hook
  }, [systemColorScheme, state.theme]);

  /* ---------- Toasts ---------- */
  const showToast = useCallback((toast: ToastMessage) => {
    const id = uid();
    dispatch({ type: 'ADD_TOAST', payload: { ...toast, id } });
    const duration = toast.duration ?? 3800;
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
  }, []);

  /* ---------- Notifications ---------- */
  const addNotification = useCallback(
    (title: string, desc: string, icon: string = 'bell') => {
      const note: Notification = {
        id: uid(),
        title,
        desc,
        icon,
        time: 'Just now',
        read: false,
      };
      // Will be merged in the reducer via dedicated action
      storage.getNotifications().then((existing) => {
        const next = [note, ...existing].slice(0, 50);
        storage.setNotifications(next);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: next });
      });
      if (state.notificationsEnabled) {
        showToast({ type: 'default', icon, title, desc });
      }
    },
    [showToast, state.notificationsEnabled],
  );

  /* ---------- Achievements ---------- */
  const checkAchievements = useCallback(async () => {
    const achievements = await storage.getAchievements();
    let unlocked = false;
    const updated = achievements.map((a) => {
      if (a.unlocked) return a;
      if (a.id === 'first_income' && state.incomes.length >= 1) {
        unlocked = true;
        return { ...a, unlocked: true };
      }
      if (a.id === 'first_expense' && state.expenses.length >= 1) {
        unlocked = true;
        return { ...a, unlocked: true };
      }
      if (a.id === 'budget_master' && state.budgets.length >= 3) {
        unlocked = true;
        return { ...a, unlocked: true };
      }
      if (a.id === 'goal_achiever' && state.goals.some((g) => g.current >= g.target)) {
        unlocked = true;
        return { ...a, unlocked: true };
      }
      if (a.id === 'savings_streak' && state.savingsStreak >= 7) {
        unlocked = true;
        return { ...a, unlocked: true };
      }
      if (a.id === 'financial_expert' && state.healthScore >= 80) {
        unlocked = true;
        return { ...a, unlocked: true };
      }
      return a;
    });
    if (unlocked) {
      await storage.setAchievements(updated);
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: updated });
      const names = updated.filter((a) => a.unlocked).map((a) => a.name).join(', ');
      addNotification('🏆 Achievement Unlocked!', `You earned: ${names}`, 'trophy');
    }
  }, [state.incomes.length, state.expenses.length, state.budgets.length, state.goals, state.savingsStreak, state.healthScore, addNotification]);

  /* ---------- Health ---------- */
  const refreshHealth = useCallback(async () => {
    const now = new Date();
    const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cutoff60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentIncomeCount = state.incomes.filter((i) => new Date(i.date) >= cutoff30).length;
    const monthIncome = state.incomes
      .filter((i) => new Date(i.date) >= cutoff30)
      .reduce((s, i) => s + i.amount, 0);
    const monthExpense = state.expenses
      .filter((e) => new Date(e.date) >= cutoff30)
      .reduce((s, e) => s + e.amount, 0);
    const prevMonthIncome = state.incomes
      .filter((i) => {
        const d = new Date(i.date);
        return d >= cutoff60 && d < cutoff30;
      })
      .reduce((s, i) => s + i.amount, 0);
    const prevMonthExpense = state.expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= cutoff60 && d < cutoff30;
      })
      .reduce((s, e) => s + e.amount, 0);

    const report = calculateHealth({
      totalIncome: monthIncome,
      totalExpense: monthExpense,
      recentIncomeCount,
      budgets: state.budgets,
      expenses: state.expenses,
      goals: state.goals,
      prevMonthIncome,
      prevMonthExpense,
      streak: state.savingsStreak,
      achievementsUnlocked: state.achievements.filter((a) => a.unlocked).length,
    });
    await storage.setHealth(report.score);
    dispatch({ type: 'SET_HEALTH', payload: report.score });
    dispatch({ type: 'SET_HEALTH_REPORT', payload: report });
    return report.score;
  }, [state.incomes, state.expenses, state.budgets, state.goals, state.savingsStreak, state.achievements]);

  /* ---------- CRUD helpers ---------- */
  const upsertIncome = useCallback(async (item: Income) => {
    const list = state.incomes.find((i) => i.id === item.id)
      ? state.incomes.map((i) => (i.id === item.id ? item : i))
      : [...state.incomes, item];
    await storage.setIncomes(list.map(({ images, ...rest }) => rest));
    dispatch({ type: 'SET_INCOMES', payload: list });
  }, [state.incomes]);

  const deleteIncome = useCallback(async (id: string) => {
    const list = state.incomes.filter((i) => i.id !== id);
    await storage.setIncomes(list.map(({ images, ...rest }) => rest));
    await imageDB.deleteForRecord(id);
    dispatch({ type: 'SET_INCOMES', payload: list });
  }, [state.incomes]);

  const upsertExpense = useCallback(async (item: Expense) => {
    const list = state.expenses.find((i) => i.id === item.id)
      ? state.expenses.map((i) => (i.id === item.id ? item : i))
      : [...state.expenses, item];
    await storage.setExpenses(list.map(({ images, ...rest }) => rest));
    dispatch({ type: 'SET_EXPENSES', payload: list });
  }, [state.expenses]);

  const deleteExpense = useCallback(async (id: string) => {
    const list = state.expenses.filter((i) => i.id !== id);
    await storage.setExpenses(list.map(({ images, ...rest }) => rest));
    await imageDB.deleteForRecord(id);
    dispatch({ type: 'SET_EXPENSES', payload: list });
  }, [state.expenses]);

  const upsertGoal = useCallback(async (item: Goal) => {
    const list = state.goals.find((i) => i.id === item.id)
      ? state.goals.map((i) => (i.id === item.id ? item : i))
      : [...state.goals, item];
    await storage.setGoals(list.map(({ images, ...rest }) => rest));
    dispatch({ type: 'SET_GOALS', payload: list });
  }, [state.goals]);

  const deleteGoal = useCallback(async (id: string) => {
    const list = state.goals.filter((i) => i.id !== id);
    await storage.setGoals(list.map(({ images, ...rest }) => rest));
    await imageDB.deleteForRecord(id);
    dispatch({ type: 'SET_GOALS', payload: list });
  }, [state.goals]);

  const upsertBudget = useCallback(async (item: Budget) => {
    const list = state.budgets.find((i) => i.id === item.id)
      ? state.budgets.map((i) => (i.id === item.id ? item : i))
      : [...state.budgets, item];
    await storage.setBudgets(list);
    dispatch({ type: 'SET_BUDGETS', payload: list });
  }, [state.budgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const list = state.budgets.filter((i) => i.id !== id);
    await storage.setBudgets(list);
    dispatch({ type: 'SET_BUDGETS', payload: list });
  }, [state.budgets]);

  /* ---------- Settings ---------- */
  const setCurrency = useCallback(async (c: CurrencySymbol) => {
    await storage.setCurrency(c);
    dispatch({ type: 'SET_CURRENCY', payload: c });
  }, []);
  const setTheme = useCallback(async (t: ThemeMode) => {
    await storage.setTheme(t);
    dispatch({ type: 'SET_THEME', payload: t });
  }, []);
  const setBiometricsEnabled = useCallback(async (v: boolean) => {
    await storage.setBiometricsEnabled(v);
    dispatch({ type: 'SET_BIOMETRICS', payload: v });
  }, []);
  const setNotificationsEnabled = useCallback(async (v: boolean) => {
    dispatch({ type: 'SET_NOTIFICATIONS_ENABLED', payload: v });
  }, []);
  const updateProfile = useCallback(async (patch: Partial<User>) => {
    const next = state.user ? { ...state.user, ...patch } : null;
    if (next) {
      await storage.setUser(next);
      dispatch({ type: 'SET_USER', payload: next });
    }
    if (patch.currency !== undefined) {
      await storage.setCurrency(patch.currency as CurrencySymbol);
      dispatch({ type: 'SET_CURRENCY', payload: patch.currency as CurrencySymbol });
    }
    if (patch.theme !== undefined) {
      await storage.setTheme(patch.theme);
      dispatch({ type: 'SET_THEME', payload: patch.theme });
    }
    if (patch.biometricsEnabled !== undefined) {
      // Route through authService so the users-index entry, current-user
      // pointer, and the legacy AsyncStorage key all stay in sync.
      const updated = await authService.setBiometricsEnabled(patch.biometricsEnabled);
      if (updated) {
        dispatch({ type: 'SET_USER', payload: updated });
      }
      dispatch({ type: 'SET_BIOMETRICS', payload: patch.biometricsEnabled });
    }
  }, [state.user]);

  const signInCompleted = useCallback(async () => {
    const user = await storage.getUser();
    const users = await storage.getUsers();
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_USERS', payload: users });
  }, []);
  const markOnboardingDone = useCallback(async () => {
    await storage.setOnboardingDone(true);
    dispatch({ type: 'SET_ONBOARDING_DONE', payload: true });
  }, []);

  const logout = useCallback(async () => {
    await storage.setUser(null);
    await storage.setToken(null);
    await storage.setSessionExpiry(null);
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_TOKEN', payload: null });
  }, []);

  /* ---------- Streak tracker ---------- */
  useEffect(() => {
    (async () => {
      const today = toLocalDateString(new Date());
      const lastSave = await storage.getLastSave();
      if (lastSave === today) return;

      const hasTodayIncome = state.incomes.some((i) => i.date === today);
      if (!hasTodayIncome) return;

      let streak = state.savingsStreak;
      if (lastSave) {
        const last = new Date(lastSave);
        const todayD = new Date(today);
        const diff = Math.round((todayD.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) streak += 1;
        else if (diff > 1) streak = 1;
      } else {
        streak = 1;
      }
      await storage.setLastSave(today);
      await storage.setStreak(streak);
      dispatch({ type: 'SET_STREAK', payload: streak });
      if (streak > 0 && streak % 5 === 0) {
        addNotification('🔥 Savings Streak!', `${streak} days in a row!`, 'fire');
      }
    })();
  }, [state.incomes, state.savingsStreak, addNotification]);

  /* ---------- Memoize context ---------- */
  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      dispatch,
      showToast,
      addNotification,
      upsertIncome,
      deleteIncome,
      upsertExpense,
      deleteExpense,
      upsertGoal,
      deleteGoal,
      upsertBudget,
      deleteBudget,
      setCurrency,
      setTheme,
      setBiometricsEnabled,
      setNotificationsEnabled,
      updateProfile,
      signInCompleted,
      markOnboardingDone,
      refreshHealth,
      checkAchievements,
      logout,
    }),
    [
      state,
      showToast,
      addNotification,
      upsertIncome,
      deleteIncome,
      upsertExpense,
      deleteExpense,
      upsertGoal,
      deleteGoal,
      upsertBudget,
      deleteBudget,
      setCurrency,
      setTheme,
      setBiometricsEnabled,
      setNotificationsEnabled,
      updateProfile,
      signInCompleted,
      markOnboardingDone,
      refreshHealth,
      checkAchievements,
      logout,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}