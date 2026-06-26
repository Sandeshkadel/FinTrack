import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

/**
 * Toast container — slides in from the top, auto-dismisses.
 * Mirrors the showToast() in the web version.
 */
export function ToastContainer() {
  const { toasts, dispatch } = useApp();

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          icon={t.icon}
          title={t.title}
          desc={t.desc}
          onClose={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id ?? '' })}
        />
      ))}
    </View>
  );
}

interface ToastProps {
  type: 'default' | 'success' | 'danger' | 'warning' | 'info';
  icon: string;
  title: string;
  desc?: string;
  onClose: () => void;
}

const ICON_COLOR: Record<string, string> = {
  success: COLORS.success,
  danger: COLORS.danger,
  warning: COLORS.warning,
  info: COLORS.primary,
  default: COLORS.primary,
};

function Toast({ type, icon, title, desc, onClose }: ToastProps) {
  const slide = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          transform: [{ translateY: slide }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: `${ICON_COLOR[type]}20` },
        ]}
      >
        <Ionicons
          name={(icon as keyof typeof Ionicons.glyphMap) || 'notifications'}
          size={18}
          color={ICON_COLOR[type] || COLORS.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {desc ? <Text style={styles.desc} numberOfLines={2}>{desc}</Text> : null}
      </View>
      <Pressable onPress={onClose} hitSlop={8} style={{ padding: 6 }}>
        <Ionicons name="close" size={18} color="#888" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    gap: 12,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  desc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});