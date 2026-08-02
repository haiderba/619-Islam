import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Text, Platform } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  const isDark = colors.isDark;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 12,
          right: 12,
          height: 68,
          borderRadius: 34,
          backgroundColor: isDark ? 'rgba(11, 28, 22, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 10,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
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
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 19, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="deen"
        options={{
          title: 'Deen Hub',
          headerTitle: 'Deen Companion',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 19, color }}>🕌</Text>,
        }}
      />
      <Tabs.Screen
        name="hubs"
        options={{
          title: 'Hubs',
          headerTitle: 'Habit Hubs & Circles',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 19, color }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          headerTitle: 'Goal Management',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 19, color }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Analytics & Streaks',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 19, color }}>📈</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'App Settings',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 19, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
