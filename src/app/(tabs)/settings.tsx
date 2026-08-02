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
import { StorageService } from '@/services/storageService';
import { AppLanguage } from '@/types/user';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, settings, saveSettings, saveProfile, refreshProfile } = useUserProfile();

  const [sound, setSound] = useState(settings.soundEnabled);
  const [vibration, setVibration] = useState(settings.vibrationEnabled);

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
            await refreshProfile();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <Card variant="goldGlow" style={styles.userCard}>
          <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          <Text style={styles.userSub}>619 Discipline Member</Text>
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Language</Text>
        <Card style={styles.card}>
          <View style={styles.optionRow}>
            {(['English', 'Urdu'] as AppLanguage[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.chip,
                  profile?.language === lang && styles.chipSelected,
                ]}
                onPress={() => handleSetLanguage(lang)}
              >
                <Text
                  style={[
                    styles.chipText,
                    profile?.language === lang && styles.chipTextSelected,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notifications Settings */}
        <Text style={styles.sectionTitle}>Notification Alerts</Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Sound Alerts</Text>
            <Switch
              value={sound}
              onValueChange={toggleSound}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12, marginTop: 12 }]}>
            <Text style={styles.rowLabel}>Vibration</Text>
            <Switch
              value={vibration}
              onValueChange={toggleVibration}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Backup & Data */}
        <Text style={styles.sectionTitle}>Data & Security</Text>
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
          <Text style={styles.appName}>619 — Discipline Daily</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (MVP)</Text>
          <Text style={styles.appTagline}>Designed for Deen & Dunya</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    padding: 20,
    marginBottom: 16,
  },
  userName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  userSub: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.secondaryText,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  footerInfo: {
    alignItems: 'center',
    marginVertical: 32,
  },
  appName: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  appVersion: {
    color: Colors.secondaryText,
    fontSize: 12,
    marginTop: 4,
  },
  appTagline: {
    color: Colors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
});
