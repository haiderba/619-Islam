import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  if (loading || user?.role !== 'admin') return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}
