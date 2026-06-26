import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

import { DashboardScreen } from '@/screens/DashboardScreen';
import { ListScreen } from '@/screens/ListScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { InsightsScreen } from '@/screens/InsightsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { MoreScreen } from '@/screens/MoreScreen';

import { useApp } from '@/context/AppContext';

type RootStackParams = {
  Tabs: undefined;
  Income: undefined;
  Expense: undefined;
  Goal: undefined;
  Budget: undefined;
  Calendar: undefined;
  Reports: undefined;
  Insights: undefined;
  Profile: undefined;
  Search: undefined;
  Settings: undefined;
};

type TabParams = {
  Dashboard: undefined;
  Income: undefined;
  Expense: undefined;
  Goal: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<TabParams>();
const Stack = createNativeStackNavigator<RootStackParams>();

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Ionicons name={(focused ? name : `${String(name)}-outline`) as any} size={22} color={color} />
      {focused ? <View style={[tabStyles.dot, { backgroundColor: color }]} /> : null}
    </View>
  );
}

function MainTabs({ navigation }: any) {
  const theme = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.card,
          borderTopWidth: 0,
          elevation: 0,
          height: 78,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.card }]} />
          ),
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const map: Record<keyof TabParams, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'home',
            Income: 'trending-up',
            Expense: 'trending-down',
            Goal: 'trophy',
            More: 'grid',
          };
          return <TabIcon name={map[route.name]} color={color} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" options={{ tabBarLabel: 'Home' }}>
        {() => (
          <DashboardScreen
            onNavigate={(p) => navigation.navigate(p as any)}
            onOpenSearch={() => navigation.navigate('Search')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Income">
        {() => <ListScreen kind="income" onBack={() => navigation.navigate('Dashboard')} />}
      </Tab.Screen>
      <Tab.Screen name="Expense" options={{ tabBarLabel: 'Expenses' }}>
        {() => <ListScreen kind="expense" onBack={() => navigation.navigate('Dashboard')} />}
      </Tab.Screen>
      <Tab.Screen name="Goal" options={{ tabBarLabel: 'Goals' }}>
        {() => <ListScreen kind="goal" onBack={() => navigation.navigate('Dashboard')} />}
      </Tab.Screen>
      <Tab.Screen name="More">
        {() => (
          <MoreScreen
            onBack={() => navigation.navigate('Dashboard')}
            onNavigate={(p) => navigation.navigate(p as any)}
            onOpenSearch={() => navigation.navigate('Search')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

interface NavProps {
  onSignOut: () => void;
}

export function RootNavigator({ onSignOut }: NavProps) {
  const theme = useAppTheme();
  const navTheme = theme.isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.bg,
      card: theme.card,
      text: theme.text,
      border: theme.inputBorder,
      primary: COLORS.primary,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.bg,
      card: theme.card,
      text: theme.text,
      border: theme.inputBorder,
      primary: COLORS.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen name="Income">
          {({ navigation }) => (
            <ListScreen kind="income" onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Expense">
          {({ navigation }) => (
            <ListScreen kind="expense" onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Goal">
          {({ navigation }) => (
            <ListScreen kind="goal" onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Budget">
          {({ navigation }) => (
            <ListScreen kind="budget" onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Calendar">
          {({ navigation }) => (
            <CalendarScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Reports">
          {({ navigation }) => (
            <ReportsScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Insights">
          {({ navigation }) => (
            <InsightsScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {({ navigation }) => (
            <SettingsScreen
              onBack={() => navigation.goBack()}
              onNavigate={(p) => navigation.navigate(p as any)}
              onSignOut={onSignOut}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {({ navigation }) => (
            <ProfileScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Search">
          {({ navigation }) => (
            <SearchScreen
              onBack={() => navigation.goBack()}
              onNavigate={(p) => navigation.navigate(p as any)}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
});