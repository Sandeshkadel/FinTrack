import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'purple';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const COLORS_MAP: Record<string, { bg: string; fg: string }> = {
  default: { bg: COLORS.gray200, fg: COLORS.gray700 },
  success: { bg: '#d1fae5', fg: '#065f46' },
  danger: { bg: '#fecaca', fg: '#991b1b' },
  warning: { bg: '#fef3c7', fg: '#92400e' },
  purple: { bg: COLORS.primaryBg, fg: COLORS.primary },
};

export function Badge({ label, variant, color, style }: BadgeProps) {
  // If color is provided as a hex, derive a light bg with that fg
  const lookup = color ? COLORS_MAP[color] : null;
  const c = lookup ?? COLORS_MAP[variant ?? 'default'] ?? { bg: COLORS.gray200, fg: COLORS.gray700 };
  const useColorTint = !lookup && !!color;
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: useColorTint ? `${color}22` : c.bg },
        style,
      ]}
    >
      <Text style={[styles.label, { color: useColorTint ? color : c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});