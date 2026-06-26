import React, { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches any uncaught render error and shows a friendly fallback screen
 * instead of crashing the whole app. The user can reload the app from here.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  handleRestart = () => {
    // Clear error state — the user will be sent back to the splash screen
    // and the app will rehydrate from AsyncStorage on next mount.
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          FinTrack Pro hit an unexpected error. Your data is safe — it never left this device.
        </Text>
        {this.state.error?.message ? (
          <Text style={styles.errorDetail} numberOfLines={4}>
            {this.state.error.message}
          </Text>
        ) : null}
        <Pressable onPress={this.handleRestart} style={styles.button}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: COLORS.lightBg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 16,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  errorDetail: {
    fontSize: 11,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 18,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    marginTop: 28,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});