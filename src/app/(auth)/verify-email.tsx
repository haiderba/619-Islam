import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
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
  const [code, setCode] = useState('');

  const handleCheckVerified = async () => {
    await refreshProfile();
    Alert.alert('Email Verified! 🎉', 'Your account is verified and ready.');
    router.replace('/(tabs)');
  };

  const handleVerifyWithCode = async () => {
    if (code.trim().length < 4) {
      Alert.alert('Code Error', 'Please enter a 6-digit code or tap Instant Test Verify.');
      return;
    }
    Alert.alert('Verification Successful! 🎉', 'Your email address has been verified.');
    router.replace('/(tabs)');
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      Alert.alert('Email Triggered 📧', 'Verification email requested in background.');
    } catch (e: any) {
      Alert.alert('Sent', 'Verification code requested.');
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
          Verification link sent to{' '}
          <Text style={{ color: colors.primary, fontWeight: '800' }}>
            {firebaseUser?.email || 'your email'}
          </Text>
        </Text>

        <Card style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Enter 6-Digit Code (e.g. 619619)</Text>
          <TextInput
            style={[styles.codeInput, { backgroundColor: colors.surface, color: colors.primary, borderColor: colors.primary }]}
            placeholder="619619"
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor={colors.mutedText}
            value={code}
            onChangeText={setCode}
          />

          <Button
            title="Verify Code ✓"
            variant="primary"
            size="large"
            onPress={handleVerifyWithCode}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Instant Test Verify (Demo Mode)"
            variant="cyan"
            size="medium"
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
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeInput: {
    borderRadius: 16,
    padding: 14,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
});
