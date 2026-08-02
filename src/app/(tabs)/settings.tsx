import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from '@/context/ThemeContext';
import { StorageService } from '@/services/storageService';
import { NotificationService } from '@/services/notificationService';
import { AppLanguage, AppTheme } from '@/types/user';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, settings, saveSettings, saveProfile, refreshProfile } = useUserProfile();
  const { themeMode, setThemeMode, colors } = useTheme();

  const [sound, setSound] = useState(settings.soundEnabled);
  const [vibration, setVibration] = useState(settings.vibrationEnabled);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    saveSettings({ ...settings, notificationsEnabled: val });

    if (val) {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        await NotificationService.schedulePrayerReminders();
        await NotificationService.scheduleDailyHabitReminder(20, 0);
        Alert.alert('Notifications Active 🔔', 'Prayer and daily goal reminders have been scheduled.');
      } else {
        Alert.alert('Permission Required', 'Please allow notification permissions in your device settings.');
      }
    } else {
      await NotificationService.cancelAll();
    }
  };

  const toggleSound = (val: boolean) => {
    setSound(val);
    saveSettings({ ...settings, soundEnabled: val });
  };

  const toggleVibration = (val: boolean) => {
    setVibration(val);
    saveSettings({ ...settings, vibrationEnabled: val });
  };

  const handleSetLanguage = (lang: AppLanguage) => {
    if (profile) {
      saveProfile({ ...profile, language: lang });
    }
  };

  const handleSetTheme = (mode: AppTheme) => {
    setThemeMode(mode);
  };

  const handleBackup = async () => {
    try {
      const dataStr = await StorageService.exportAllData();
      Alert.alert(
        'Backup Exported',
        `Your 619 data has been exported successfully.\nData length: ${dataStr.length} characters.`
      );
    } catch {
      Alert.alert('Error', 'Failed to generate backup.');
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase all your goals, streaks, and user preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            await NotificationService.cancelAll();
            await refreshProfile();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <Card variant="goldGlow" style={styles.userCard}>
          <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || 'User'}</Text>
          <Text style={[styles.userSub, { color: colors.primary }]}>619 Discipline Member</Text>
        </Card>

        {/* Theme Selection */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Theme</Text>
        <Card style={styles.card}>
          <View style={styles.optionRow}>
            {(['Dark', 'Light', 'System'] as AppTheme[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  themeMode === mode && { backgroundColor: colors.greenGlow, borderColor: colors.primary },
                ]}
                onPress={() => handleSetTheme(mode)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.secondaryText },
                    themeMode === mode && { color: colors.primaryLight, fontWeight: '800' },
                  ]}
                >
                  {mode === 'Dark' ? '🌙 Dark' : mode === 'Light' ? '☀️ Light' : '⚙️ System'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Language</Text>
        <Card style={styles.card}>
          <View style={styles.optionRow}>
            {(['English', 'Urdu'] as AppLanguage[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  profile?.language === lang && { backgroundColor: colors.greenGlow, borderColor: colors.primary },
                ]}
                onPress={() => handleSetLanguage(lang)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.secondaryText },
                    profile?.language === lang && { color: colors.primaryLight, fontWeight: '800' },
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Push Notifications & Alerts Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Alerts & Reminders</Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Prayer & Daily Habit Alerts</Text>
              <Text style={[styles.rowSub, { color: colors.secondaryText }]}>5-min pre-prayer alerts & 8 PM goal check-in</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Sound Alerts</Text>
            <Switch
              value={sound}
              onValueChange={toggleSound}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Vibration</Text>
            <Switch
              value={vibration}
              onValueChange={toggleVibration}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>

        {/* Backup & Data */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Security</Text>
        <Card style={styles.card}>
          <Button
            title="Backup Data"
            variant="outline"
            onPress={handleBackup}
            style={{ marginBottom: 10 }}
          />
          <Button
            title="Reset All Data"
            variant="danger"
            onPress={handleResetApp}
          />
        </Card>

        {/* App Info */}
        <View style={styles.footerInfo}>
          <Text style={[styles.appName, { color: colors.primary }]}>619 — Discipline Daily</Text>
          <Text style={[styles.appVersion, { color: colors.secondaryText }]}>Version 1.2.0 (Notifications Enabled)</Text>
          <Text style={[styles.appTagline, { color: colors.mutedText }]}>Royal Emerald & Gold Theme • Firebase Auth & Hubs</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    padding: 20,
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
  },
  userSub: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  footerInfo: {
    alignItems: 'center',
    marginVertical: 32,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
  },
  appVersion: {
    fontSize: 12,
    marginTop: 4,
  },
  appTagline: {
    fontSize: 11,
    marginTop: 2,
  },
});
