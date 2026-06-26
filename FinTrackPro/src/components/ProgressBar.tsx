import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface ProgressBarProps {
  value: number; // 0..1, or absolute when used with max
  max?: number;
  height?: number;
  status?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  caption?: string;
  color?: string;
}

const STATUS_COLORS = {
  default: [COLORS.primary, COLORS.primaryLight],
  success: [COLORS.success, '#34d399'],
  warning: [COLORS.warning, '#fbbf24'],
  danger: [COLORS.danger, '#f87171'],
};

/**
 * Shimmer-enabled progress bar — matches the web look (animated gradient fill).
 */
export function ProgressBar({
  value,
  max,
  height = 8,
  status = 'default',
  showLabel,
  label,
  caption,
  color,
}: ProgressBarProps) {
  const theme = useAppTheme();
  const shimmer = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;
  const ratio = max != null ? value / max : value;
  const safe = Math.max(0, Math.min(1, ratio));
  const [defaultC1, defaultC2] = STATUS_COLORS[status];
  const c1 = color ?? defaultC1;
  const c2 = color ?? defaultC2;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: safe,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [safe, widthAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmer]);

  const width = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          height,
          backgroundColor: theme.inputBorder,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width,
            borderRadius: height / 2,
            backgroundColor: c1,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: c2,
                opacity: 0.35,
                transform: [{ translateX }],
              },
            ]}
          />
        </Animated.View>
      </View>
      {(showLabel || label || caption) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '600' }}>
            {label ?? `${Math.round(safe * 100)}%`}
          </Text>
          {caption ? (
            <Text style={{ color: theme.textFaint, fontSize: 12 }}>{caption}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}