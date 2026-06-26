import React, { useImperativeHandle, useRef, forwardRef, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';
import { Button } from './Button';

interface ConfirmSheetProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary' | 'success';
  danger?: boolean;
  visible?: boolean;
  customContent?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ConfirmSheetHandle {
  open: () => void;
  close: () => void;
}

export const ConfirmSheet = forwardRef<ConfirmSheetHandle, ConfirmSheetProps>(
  (
    {
      title = 'Are you sure?',
      message = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type,
      danger,
      visible = false,
      customContent,
      onConfirm,
      onCancel,
    },
    ref,
  ) => {
    const sheetRef = useRef<BottomSheet>(null);
    const theme = useAppTheme();
    const effectiveType: 'danger' | 'primary' | 'success' = danger
      ? 'danger'
      : type ?? 'primary';

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    // Sync external `visible` prop
    React.useEffect(() => {
      if (visible) sheetRef.current?.expand();
      else sheetRef.current?.close();
    }, [visible]);

    const handleConfirm = useCallback(() => {
      sheetRef.current?.close();
      setTimeout(() => onConfirm(), 200);
    }, [onConfirm]);

    const handleCancel = useCallback(() => {
      sheetRef.current?.close();
      setTimeout(() => onCancel?.(), 200);
    }, [onCancel]);

    const iconName =
      effectiveType === 'danger' ? 'warning-outline' : effectiveType === 'success' ? 'checkmark-circle-outline' : 'help-circle-outline';
    const iconColor = effectiveType === 'danger' ? COLORS.danger : effectiveType === 'success' ? COLORS.success : COLORS.primary;

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={customContent ? ['55%', '85%'] : ['40%']}
        enablePanDownToClose
        backdropComponent={(p) => (
          <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.6} />
        )}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.textMuted }}
      >
        <BottomSheetView style={styles.content}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${iconColor}15` },
            ]}
          >
            <ConfirmIcon name={iconName} color={iconColor} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {message ? <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text> : null}
          {customContent}
          <View style={styles.actions}>
            <Button
              title={cancelText}
              variant="outline"
              onPress={handleCancel}
              style={{ flex: 1 }}
            />
            <Button
              title={confirmText}
              variant={effectiveType === 'danger' ? 'danger' : effectiveType === 'success' ? 'success' : 'primary'}
              onPress={handleConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

ConfirmSheet.displayName = 'ConfirmSheet';

// Inline icon component to keep imports clean
import { Ionicons } from '@expo/vector-icons';
function ConfirmIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) {
  return <Ionicons name={name} size={36} color={color} />;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});