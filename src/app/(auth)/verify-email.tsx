import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useTheme();
  const { verifyOtp, resendVerification } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert('Invalid Code', 'Please enter your full verification code.');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is missing. Please try signing up again.');
      return;
    }

    setVerifying(true);
    try {
      await verifyOtp(email, otp);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid or expired code.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendVerification(email);
      Alert.alert('Email Sent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Failed to resend', error.message || 'Please wait before trying again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail color={colors.primary} size={48} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          We sent a verification code to
        </Text>
        <Text style={[styles.emailText, { color: colors.primary }]}>{email || 'your email'}</Text>
        
        <Card style={[styles.card, { marginTop: 32 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="00000000"
            keyboardType="number-pad"
            maxLength={8}
            placeholderTextColor={colors.mutedText}
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />

          <Button
            title="Verify Code"
            variant="primary"
            size="large"
            loading={verifying}
            onPress={handleVerify}
            style={{ marginTop: 24, marginBottom: 12 }}
          />

          <Button
            title="Resend Code"
            variant="secondary"
            loading={resending}
            onPress={handleResend}
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
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '800',
    borderWidth: 1,
  },
});
