export type CurrencySymbol = '$' | '€' | '£' | '¥' | '₹';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Income {
  id: string;
  source: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
  tags?: string;
  images?: string[];
  createdAt: string;
  createdTime: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  tags?: string;
  images?: string[];
  createdAt: string;
  createdTime: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline?: string;
  images?: string[];
  createdAt: string;
  createdTime: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly';
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  icon: string;
  time: string;
  read: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
  // Optional preferences persisted with the user
  theme?: ThemeMode;
  currency?: CurrencySymbol;
  symbol?: string;
  biometricsEnabled?: boolean;
}

export interface ToastMessage {
  id?: string;
  type: 'default' | 'success' | 'danger' | 'warning' | 'info';
  icon: string;
  title: string;
  desc?: string;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary' | 'success';
}

export interface PromptOptions {
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export type ChartRange = 'week' | 'month' | '6m' | 'year' | 'all';
export type ReportRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Page =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'goals'
  | 'budgets'
  | 'calendar'
  | 'reports'
  | 'insights'
  | 'settings';

export interface OCRResult {
  amount: number | null;
  date: string | null;
  description: string | null;
  processedImageUrl?: string;
}