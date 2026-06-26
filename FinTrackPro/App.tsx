import React, { useEffect, useState, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { AppProvider, useApp } from '@/context/AppContext';

import { SplashScreen as Splash } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { AuthScreen } from '@/screens/AuthScreen';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ToastContainer } from '@/components/ToastContainer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { COLORS } from '@/constants/colors';

// Prevent native splash from auto-hiding so we control the transition.
// Wrap in try/catch so a failure here never blocks the rest of the app.
try {
  SplashScreen.preventAutoHideAsync().catch(() => {});
} catch {}
try {
  SystemUI.setBackgroundColorAsync(COLORS.primary).catch(() => {});
} catch {}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <AppProvider>
            <ThemeProvider>
              <AppGate />
            </ThemeProvider>
          </AppProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function AppGate() {
  const theme = useAppTheme();
  const { user, onboardingDone } = useApp();
  const [phase, setPhase] = useState<'splash' | 'onboarding' | 'auth' | 'main'>('splash');

  // Hide native splash after a tick and pick the right phase
  useEffect(() => {
    let mounted = true;
    setTimeout(async () => {
      try { await SplashScreen.hideAsync(); } catch {}
      if (!mounted) return;
      // Decide based on persisted state
      if (!onboardingDone) setPhase('onboarding');
      else if (!user) setPhase('auth');
      else setPhase('main');
    }, 50);
    return () => { mounted = false; };
  }, []); // run once

  // When user signs in via AuthScreen, AppContext rehydrates -> user becomes non-null
  useEffect(() => {
    if (phase === 'auth' && user) setPhase('main');
  }, [user, phase]);

  const handleSplashDone = useCallback(() => {
    if (!onboardingDone) setPhase('onboarding');
    else if (!user) setPhase('auth');
    else setPhase('main');
  }, [onboardingDone, user]);

  const handleOnboardingDone = useCallback(() => {
    setPhase('auth');
  }, []);

  const handleAuthenticated = useCallback(() => {
    setPhase('main');
  }, []);

  const handleSignOut = useCallback(async () => {
    setPhase('auth');
  }, []);

  return (
    <BottomSheetModalProvider>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        {phase === 'splash' ? (
          <Splash onDone={handleSplashDone} />
        ) : phase === 'onboarding' ? (
          <OnboardingScreen onDone={handleOnboardingDone} />
        ) : phase === 'auth' ? (
          <AuthScreen onAuthenticated={handleAuthenticated} />
        ) : (
          <RootNavigator onSignOut={handleSignOut} />
        )}
        <ToastContainer />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});