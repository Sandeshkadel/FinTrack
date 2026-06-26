import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from '@/context/AppContext';
import { COLORS } from '@/constants/colors';
import type { ThemeMode } from '@/types';

export type { ThemeMode };

export interface ThemeColors {
  bg: string;
  card: string;
  input: string;
  inputBorder: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  glass: string;
  glassBorder: string;
  sidebar: string;
  sidebarBorder: string;
  divider: string;
  isDark: boolean;
  primary: string;
  accent: string;
  success: string;
  danger: string;
  warning: string;
  shadow: string;
  backdrop: string;
}

const lightTheme: ThemeColors = {
  bg: COLORS.lightBg,
  card: COLORS.lightCard,
  input: COLORS.lightInput,
  inputBorder: COLORS.lightBorder,
  border: COLORS.gray200,
  text: COLORS.dark,
  textMuted: COLORS.gray500,
  textFaint: COLORS.gray400,
  glass: COLORS.glassLight,
  glassBorder: COLORS.glassLightBorder,
  sidebar: COLORS.glassLight,
  sidebarBorder: COLORS.glassLightBorder,
  divider: COLORS.gray200,
  isDark: false,
  primary: COLORS.primary,
  accent: COLORS.accent,
  success: COLORS.success,
  danger: COLORS.danger,
  warning: COLORS.warning,
  shadow: 'rgba(0,0,0,0.06)',
  backdrop: 'rgba(0,0,0,0.5)',
};

const darkTheme: ThemeColors = {
  bg: COLORS.darkBg,
  card: COLORS.darkCard,
  input: COLORS.darkInput,
  inputBorder: COLORS.darkBorder,
  border: COLORS.darkBorder,
  text: '#f1f5f9',
  textMuted: COLORS.gray400,
  textFaint: COLORS.gray500,
  glass: COLORS.glassDark,
  glassBorder: COLORS.glassDarkBorder,
  sidebar: COLORS.darkSidebar,
  sidebarBorder: COLORS.darkBorder,
  divider: COLORS.darkBorder,
  isDark: true,
  primary: COLORS.primaryLight,
  accent: COLORS.accent,
  success: COLORS.success,
  danger: COLORS.danger,
  warning: COLORS.warning,
  shadow: 'rgba(0,0,0,0.4)',
  backdrop: 'rgba(0,0,0,0.7)',
};

const ThemeContext = createContext<ThemeColors>(lightTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useApp();
  const sys = useColorScheme();

  const effective = useMemo(() => {
    const mode = theme === 'system' ? sys : theme;
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [theme, sys]);

  return <ThemeContext.Provider value={effective}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeColors {
  return useContext(ThemeContext);
}