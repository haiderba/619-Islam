import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
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
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="deen"
        options={{
          title: 'Deen Hub',
          headerTitle: 'Deen Companion',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 20, color }}>🕌</Text>,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          headerTitle: 'Goal Management',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 20, color }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Analytics & Streaks',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 20, color }}>📈</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'App Settings',
          tabBarIcon: ({ color }: { color: any }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
