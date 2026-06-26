import React, { useImperativeHandle, useRef, forwardRef, useEffect, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

export interface FormSheetHandle {
  open: (height?: string) => void;
  close: () => void;
}

interface FormSheetProps {
  title?: string;
  children: ReactNode;
  snapPoints?: string[];
  scrollable?: boolean;
}

export const FormSheet = forwardRef<FormSheetHandle, FormSheetProps>(
  ({ title, children, snapPoints = ['65%', '92%'], scrollable = true }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const theme = useAppTheme();

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    const Content = scrollable ? BottomSheetScrollView : View;

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(p) => (
          <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
        )}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.textMuted }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Content style={styles.content}>
            {title ? (
              <View style={styles.header}>
                <View style={[styles.handle, { backgroundColor: theme.textMuted }]} />
              </View>
            ) : null}
            <View style={{ padding: 20, paddingTop: title ? 4 : 20 }}>{children}</View>
          </Content>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  },
);

FormSheet.displayName = 'FormSheet';

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
});