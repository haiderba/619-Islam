import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const [usernameCheck, setUsernameCheck] = useState<{
    available: boolean | null;
    msg: string;
    suggestions: string[];
  }>({
    available: null,
    msg: '',
    suggestions: [],
  });

  const debounceTimer = useRef<any>(null);

  const performUsernameCheck = async (val: string) => {
    const formatted = AuthService.formatUsername(val);
    if (!formatted || formatted.length < 2) {
      setUsernameCheck({
        available: false,
        msg: 'Min 2 characters (letters, numbers, underscores allowed)',
        suggestions: [],
      });
      return;
    }

    setCheckingUsername(true);
    try {
      const isAvailable = await AuthService.checkUsernameAvailable(formatted);
      if (isAvailable) {
        setUsernameCheck({
          available: true,
          msg: `✓ @${formatted} is available!`,
          suggestions: [],
        });
      } else {
        const sugs = await AuthService.getUsernameSuggestions(formatted);
        setUsernameCheck({
          available: false,
          msg: `✕ @${formatted} is taken. Try one of these:`,
          suggestions: sugs,
        });
      }
    } catch {
      setUsernameCheck({ available: null, msg: '', suggestions: [] });
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameCheck({ available: null, msg: '', suggestions: [] });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (val.trim().length >= 2) {
        performUsernameCheck(val);
      }
    }, 400);
  };

  const handleManualCheck = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    performUsernameCheck(username);
  };

  const selectSuggestion = (sug: string) => {
    setUsername(sug);
    performUsernameCheck(sug);
  };

  const handleSignUp = async () => {
    if (loading) return; // Prevent double submission
    setSignupError(null);
    
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setSignupError('Please fill in all fields.');
      return;
    }

    if (usernameCheck.available === false) {
      setSignupError('Please choose an available username.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, username, displayName);
      router.replace({ pathname: '/(auth)/verify-email', params: { email } });
    } catch (err: any) {
      // Map common Supabase errors to friendly messages
      let errorMsg = err.message || 'Failed to create account.';
      if (errorMsg.includes('Database error saving new user')) {
        errorMsg = "Database configuration error. Please ensure the Supabase trigger is set up correctly.";
      } else if (errorMsg.toLowerCase().includes('rate limit')) {
        errorMsg = "Too many attempts. Please check your email for the code, or try again in an hour.";
      }
      setSignupError(errorMsg);
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
          <View style={styles.usernameRow}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                usernameCheck.available === true && { borderColor: colors.primary, borderWidth: 2 },
                usernameCheck.available === false && { borderColor: colors.danger, borderWidth: 2 },
              ]}
              placeholder="e.g. usman_haider or usman619"
              autoCapitalize="none"
              placeholderTextColor={colors.mutedText}
              value={username}
              onChangeText={handleUsernameChange}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleManualCheck}
              disabled={checkingUsername || !username.trim()}
              style={[
                styles.checkBtn,
                { backgroundColor: colors.primary },
                (!username.trim() || checkingUsername) && { opacity: 0.6 },
              ]}
            >
              {checkingUsername ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.checkBtnText}>Check</Text>
              )}
            </TouchableOpacity>
          </View>

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

          {/* Username Suggestion Chips */}
          {usernameCheck.suggestions.length > 0 ? (
            <View style={styles.suggestionRow}>
              {usernameCheck.suggestions.map((sug) => (
                <TouchableOpacity
                  key={sug}
                  activeOpacity={0.8}
                  style={[styles.sugChip, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                  onPress={() => selectSuggestion(sug)}
                >
                  <Text style={[styles.sugText, { color: colors.primary }]}>@{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Email Address *</Text>
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

          {signupError && (
            <View style={[styles.errorBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
              <Text style={[styles.errorBoxText, { color: colors.danger }]}>{signupError}</Text>
            </View>
          )}

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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  checkBtn: {
    marginLeft: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  checkMsg: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    marginLeft: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sugChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  sugText: {
    fontSize: 12,
    fontWeight: '800',
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
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorBoxText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
