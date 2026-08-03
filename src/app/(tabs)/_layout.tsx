import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Settings,
} from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  const isDark = colors.isDark;
  const insets = useSafeAreaInsets();

  // Dynamically calculate bottom position so it never overlaps Android system gesture bar
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 16);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomInset,
          left: 14,
          right: 14,
          height: 68,
          borderRadius: 34,
          backgroundColor: isDark ? 'rgba(11, 28, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.40)' : 'rgba(16, 185, 129, 0.28)',
          paddingBottom: 6,
          paddingTop: 8,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="deen"
        options={{
          title: 'Deen Hub',
          headerTitle: 'Deen Companion',
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="hubs"
        options={{
          title: 'Hubs',
          headerTitle: 'Habit Hubs & Circles',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          headerTitle: 'Goal Management',
          tabBarIcon: ({ color, size }) => (
            <Target color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Analytics & Streaks',
          tabBarIcon: ({ color, size }) => (
            <TrendingUp color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'App Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={22} strokeWidth={2.4} />
          ),
        }}
      />
    </Tabs>
  );
}
