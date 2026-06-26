import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  style,
  ...rest
}: InputProps) {
  const theme = useAppTheme();
  return (
    <View style={[{ marginBottom: 12 }, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: theme.input,
            borderColor: error ? COLORS.danger : theme.inputBorder,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={theme.textMuted} style={{ marginLeft: 12 }} />
        ) : null}
        <TextInput
          placeholderTextColor={theme.textFaint}
          style={[
            styles.input,
            { color: theme.text },
            leftIcon ? { paddingLeft: 8 } : null,
            rightIcon ? { paddingRight: 40 } : null,
            inputStyle,
            style,
          ]}
          {...rest}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={10}
          >
            <Ionicons name={rightIcon} size={20} color={theme.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  wrap: {
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
});