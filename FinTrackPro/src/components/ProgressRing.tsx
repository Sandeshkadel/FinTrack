import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0..1
  value?: number; // absolute number (used together with max)
  max?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  suffix?: string;
  sublabel?: string;
}

/**
 * Progress ring used in the dashboard for financial health.
 */
export function ProgressRing({
  size = 130,
  strokeWidth = 12,
  progress,
  value,
  max = 100,
  color,
  trackColor,
  label,
  suffix,
  sublabel,
}: ProgressRingProps) {
  const theme = useAppTheme();
  const ratio = progress ?? (value != null ? value / max : 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.max(0, Math.min(1, ratio));
  const stroke = color ?? 'url(#ringGrad)';
  const track = trackColor ?? theme.inputBorder;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: theme.text, fontSize: 32, fontWeight: '800' }}>
          {label ?? `${Math.round(ratio * 100)}`}
        </Text>
        {sublabel ? (
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
            {sublabel}
          </Text>
        ) : suffix ? (
          <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '500' }}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
