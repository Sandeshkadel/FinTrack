// Brand constants — matches the web version exactly
export const COLORS = {
  primary: '#8b5cf6',
  primaryDark: '#7c3aed',
  primaryLight: '#a78bfa',
  primaryGlow: 'rgba(139, 92, 246, 0.5)',
  primaryGlowSoft: 'rgba(139, 92, 246, 0.25)',
  primaryBg: '#f5f3ff',
  accent: '#ec4899',
  success: '#10b981',
  successGlow: 'rgba(16, 185, 129, 0.35)',
  danger: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',
  warning: '#f59e0b',
  dark: '#111827',
  darkSecondary: '#1f2937',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  // Dark theme tokens
  darkBg: '#0f172a',
  darkCard: '#1e293b',
  darkInput: '#334155',
  darkBorder: '#475569',
  darkSidebar: '#1e1b2e',
  // Light theme tokens
  lightBg: '#f9fafb',
  lightCard: '#ffffff',
  lightInput: '#ffffff',
  lightBorder: '#e5e7eb',
  // Glass tokens
  glassLight: 'rgba(255, 255, 255, 0.72)',
  glassLightBorder: 'rgba(255, 255, 255, 0.25)',
  glassDark: 'rgba(30, 41, 59, 0.8)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.08)',
} as const;

export const CATEGORY_COLORS = [
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export const CONFETTI_COLORS = [
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
  '#f472b6',
  '#a78bfa',
];

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 36,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  // Inter font is loaded via expo-font; these are the weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  glowSoft: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 4,
  },
};