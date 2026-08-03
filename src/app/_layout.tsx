import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

// Global error boundary to prevent silent Android crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>619 — Startup Error</Text>
          <Text style={styles.errorMsg}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function NavigationStack() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
        translucent={true}
        backgroundColor="transparent"
      />
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
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NavigationStack />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#040D0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  errorMsg: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
