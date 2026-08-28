import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/config/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your account email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/forgot-password', {
        email: email.trim().toLowerCase(),
        origin_url: 'https://619-islam.bsf1802210.workers.dev'
      });

      if (res.data.status === 'success') {
        setSent(true);
        Alert.alert(
          'Reset Link Sent! ✉️',
          'A secure 15-minute password reset link has been dispatched to your email address.'
        );
      } else {
        Alert.alert('Error', res.data.message || 'Failed to send reset link.');
      }
    } catch (err: any) {
      Alert.alert('Request Failed', err.response?.data?.detail || 'Could not send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.brandLogo, { color: colors.primary }]}>619</Text>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {sent 
              ? 'Check your inbox for your 15-minute reset link.' 
              : 'Enter your email to receive a password reset link.'}
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Account Email Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="yourname@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.mutedText}
            value={email}
            onChangeText={setEmail}
          />

          <Button
            title={sent ? "Resend Reset Link" : "Send Reset Link"}
            variant="primary"
            size="large"
            loading={loading}
            onPress={handleRequestReset}
            style={{ marginTop: 24 }}
          />

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.linkText, { color: colors.primary }]}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandLogo: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
