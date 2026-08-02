import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StorageService } from '@/services/storageService';
import { Colors } from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const profile = await StorageService.getUserProfile();
        if (profile && profile.onboardingCompleted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (e) {
        router.replace('/onboarding');
      }
    }

    const timer = setTimeout(() => {
      checkOnboarding();
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

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
