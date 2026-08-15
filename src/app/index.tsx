import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session?.user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [loading, session, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>619</Text>
      <Text style={styles.tagline}>DISCIPLINE DAILY</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: Colors.secondaryText,
    letterSpacing: 3,
    marginTop: 8,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
});
