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
  const [checking, setChecking] = useState(false);

  const handleCheckVerified = async () => {
    setChecking(true);
    try {
      await refreshProfile();
      if (firebaseUser?.emailVerified) {
        Alert.alert('Email Verified! 🎉', 'Your account is verified and ready.');
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Not Verified Yet 📬',
          'Please open your Gmail/email app, click the link sent by Firebase, then tap check again.'
        );
      }
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      Alert.alert('Verification Link Resent 📧', `A fresh link was sent to ${firebaseUser?.email || 'your email'}. Check your Spam/Junk folder if needed.`);
    } catch (e: any) {
      Alert.alert('Resend Note', e.message || 'Verification link requested.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          We sent a real verification link to{' '}
          <Text style={{ color: colors.primary, fontWeight: '800' }}>
            {firebaseUser?.email || 'your email'}
          </Text>
          . Open your email inbox and click the link!
        </Text>

        <Card style={styles.card}>
          <Button
            title="Check Verification Status ✓"
            variant="primary"
            size="large"
            loading={checking}
            onPress={handleCheckVerified}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Resend Email Link"
            variant="outline"
            loading={resending}
            onPress={handleResend}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Skip & Continue to App →"
            variant="secondary"
            onPress={() => router.replace('/(tabs)')}
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
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
  },
});
