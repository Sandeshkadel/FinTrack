import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  onPress?: () => void;
  padded?: boolean;
}

/**
 * Premium glass card — matches the .card class from the web version.
 * Glow variant adds the primary-colored shadow.
 */
export function Card({ children, style, glow, onPress, padded = true }: CardProps) {
  const theme = useAppTheme();
  const inner = (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.card,
          borderColor: glow ? COLORS.primaryGlowSoft : 'rgba(0,0,0,0.03)',
          padding: padded ? 18 : 0,
        },
        glow ? SHADOWS.glowSoft : SHADOWS.sm,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.95 : 1 })}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
});