import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { firebaseUser, resendVerification, refreshProfile } = useAuth();
  const [resending, setResending] = useState(false);

  const handleCheckVerified = async () => {
    await refreshProfile();
    if (firebaseUser?.emailVerified) {
      Alert.alert('Email Verified! 🎉', 'Your account is fully active.');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Not Verified Yet', 'Please click the link sent to your email address, then tap check again.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      Alert.alert('Email Sent 📧', 'A new verification link has been sent to your email.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not resend email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={[styles.title, { color: colors.text }]}>Verify Your Email</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          We sent a verification link to{' '}
          <Text style={{ color: colors.primary, fontWeight: '800' }}>
            {firebaseUser?.email || 'your email'}
          </Text>
          . Please verify to access Habit Hubs and social features.
        </Text>

        <Card style={styles.card}>
          <Button
            title="I Have Verified My Email"
            variant="primary"
            size="large"
            onPress={handleCheckVerified}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Resend Verification Link"
            variant="outline"
            loading={resending}
            onPress={handleResend}
          />

          <Button
            title="Continue to Home"
            variant="secondary"
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: 12 }}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
  },
});
