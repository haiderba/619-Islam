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
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/authService';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<{ available: boolean | null; msg: string }>({
    available: null,
    msg: '',
  });

  const handleUsernameChange = async (val: string) => {
    setUsername(val);
    const formatted = AuthService.formatUsername(val);

    if (!formatted || formatted.length < 3) {
      setUsernameCheck({ available: false, msg: 'Min 3 letters/numbers' });
      return;
    }

    try {
      const isAvailable = await AuthService.checkUsernameAvailable(formatted);
      if (isAvailable) {
        setUsernameCheck({ available: true, msg: `@${formatted} is available! ✓` });
      } else {
        setUsernameCheck({ available: false, msg: `@${formatted} is taken` });
      }
    } catch {
      setUsernameCheck({ available: null, msg: '' });
    }
  };

  const handleSignUp = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in all fields.');
      return;
    }

    if (usernameCheck.available === false) {
      Alert.alert('Invalid Username', usernameCheck.msg);
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, username, displayName);
      Alert.alert(
        'Verification Email Sent 📧',
        'Your account has been created. Please check your email inbox to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/verify-email'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Signup Error', err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.brandLogo, { color: colors.primary }]}>619</Text>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Join 619 to track goals & create Habit Hubs
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. Usman Haider"
            placeholderTextColor={colors.mutedText}
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={[styles.label, { color: colors.text }]}>Unique Username *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. usman619"
            autoCapitalize="none"
            placeholderTextColor={colors.mutedText}
            value={username}
            onChangeText={handleUsernameChange}
          />
          {usernameCheck.msg ? (
            <Text
              style={[
                styles.checkMsg,
                { color: usernameCheck.available ? colors.primary : colors.danger },
              ]}
            >
              {usernameCheck.msg}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="usman@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.mutedText}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="••••••••"
            secureTextEntry
            placeholderTextColor={colors.mutedText}
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Create Account"
            variant="primary"
            size="large"
            loading={loading}
            onPress={handleSignUp}
            style={{ marginTop: 20 }}
          />

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.linkText, { color: colors.primary }]}> Sign In</Text>
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
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandLogo: {
    fontSize: 40,
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
  checkMsg: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
