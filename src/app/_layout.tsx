import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

function NavigationStack() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Sign In', headerStyle: { backgroundColor: colors.card } }} />
        <Stack.Screen name="(auth)/signup" options={{ title: 'Create Account', headerStyle: { backgroundColor: colors.card } }} />
        <Stack.Screen name="(auth)/verify-email" options={{ title: 'Verify Email', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="hub/[id]"
          options={{
            title: 'Habit Hub Circle',
            headerStyle: { backgroundColor: colors.card },
          }}
        />
        <Stack.Screen
          name="goal/create"
          options={{
            presentation: 'modal',
            title: 'Create Goal',
            headerStyle: { backgroundColor: colors.card },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationStack />
      </ThemeProvider>
    </AuthProvider>
  );
}
