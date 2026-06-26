import React from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  style,
  textStyle,
  fullWidth,
}: ButtonProps) {
  const theme = useAppTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const bg: Record<string, string> = {
    primary: COLORS.primary,
    secondary: theme.input,
    outline: 'transparent',
    danger: COLORS.danger,
    success: COLORS.success,
  };
  const fg: Record<string, string> = {
    primary: '#fff',
    secondary: theme.text,
    outline: theme.text,
    danger: '#fff',
    success: '#fff',
  };
  const border: Record<string, string> = {
    primary: 'transparent',
    secondary: theme.inputBorder,
    outline: theme.inputBorder,
    danger: 'transparent',
    success: 'transparent',
  };

  const padV = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const padH = size === 'sm' ? 14 : size === 'lg' ? 28 : 20;
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  const animateTo = (v: number) =>
    Animated.spring(scale, {
      toValue: v,
      useNativeDriver: true,
      friction: 6,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={disabled || loading}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        onPress={onPress}
        style={[
          styles.base,
          {
            backgroundColor: bg[variant],
            borderColor: border[variant],
            paddingVertical: padV,
            paddingHorizontal: padH,
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? '100%' : undefined,
          },
          variant === 'primary' && SHADOWS.glowSoft,
          style,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Text style={{ color: fg[variant], fontWeight: '700', fontSize }}>
              •••
            </Text>
          ) : (
            <>
              {icon && (
                <Ionicons
                  name={icon}
                  size={fontSize + 2}
                  color={fg[variant]}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  {
                    color: fg[variant],
                    fontSize,
                    fontWeight: '700',
                    letterSpacing: 0.2,
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {iconRight && (
                <Ionicons
                  name={iconRight}
                  size={fontSize + 2}
                  color={fg[variant]}
                  style={{ marginLeft: 6 }}
                />
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});