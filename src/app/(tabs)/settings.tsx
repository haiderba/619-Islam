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
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { StorageService } from '@/services/storageService';
import { NotificationService } from '@/services/notificationService';
import { AuthService } from '@/services/authService';
import { AppLanguage, AppTheme } from '@/types/user';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, settings, saveSettings, saveProfile, refreshProfile } = useUserProfile();
  const { themeMode, setThemeMode, colors } = useTheme();
  const { user, signOut, refreshProfile: refreshAuthProfile } = useAuth();

  const [sound, setSound] = useState(settings.soundEnabled);
  const [vibration, setVibration] = useState(settings.vibrationEnabled);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);

  // Username Update Modal
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // OTA Updates Check
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const handleCheckForUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'New Update Available 🚀',
          'A new version of 619 is available over-the-air. Would you like to download and restart now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update & Restart',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (err: any) {
                  Alert.alert('Update Error', 'Could not apply update: ' + err.message);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date ✅', 'You are running the latest version of 619.');
      }
    } catch (error: any) {
      Alert.alert('Check Note ℹ️', 'OTA update checks work on installed builds (APK/IPA/EAS build). In Expo dev mode, changes reload instantly.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  // Pick Profile Photo
  const handlePickPhoto = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to update your profile photo.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const photoUri = result.assets[0].uri;
      try {
        await AuthService.updateProfilePhoto(user.uid, photoUri);
        await refreshAuthProfile();
        Alert.alert('Photo Updated 🎉', 'Your profile picture has been updated!');
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Could not update photo.');
      }
    }
  };

  // Update Username (60-day rule)
  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim()) return;

    setUpdatingUsername(true);
    try {
      await AuthService.updateUsername(user.uid, newUsername);
      await refreshAuthProfile();
      setUsernameModalVisible(false);
      Alert.alert('Username Updated 🎉', `Your new username is @${newUsername.trim().toLowerCase()}`);
    } catch (e: any) {
      Alert.alert('Username Change Note', e.message || 'Could not update username.');
    } finally {
      setUpdatingUsername(false);
    }
  };

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

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
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
        {/* User Profile Card with Photo Upload & Edit Username */}
        <Card variant="goldGlow" style={styles.userCard}>
          <View style={styles.profileHeaderRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={handlePickPhoto} style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '6'}
                  </Text>
                </View>
              )}
              <View style={[styles.cameraBadge, { backgroundColor: colors.accentGold }]}>
                <Text style={{ fontSize: 10 }}>📷</Text>
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.displayName || profile?.name || 'Discipline Member'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setNewUsername(user?.username || '');
                  setUsernameModalVisible(true);
                }}
                style={styles.handleChip}
              >
                <Text style={[styles.userHandle, { color: colors.primary }]}>
                  @{user?.username || 'set_username'} ✏️
                </Text>
              </TouchableOpacity>
              <Text style={[styles.userSub, { color: colors.secondaryText }]}>
                {user?.email || 'Logged in'}
              </Text>
            </View>
          </View>
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

        {/* Notifications Settings */}
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

        {/* Account & Data Management */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account & Data Management</Text>
        <Card style={styles.card}>
          {user ? (
            <Button
              title="Log Out of Account"
              variant="danger"
              onPress={handleSignOut}
              style={{ marginBottom: 12 }}
            />
          ) : (
            <Button
              title="Sign In / Register Account"
              variant="primary"
              onPress={() => router.push('/(auth)/login')}
              style={{ marginBottom: 12 }}
            />
          )}

          <Button
            title="Backup Data"
            variant="outline"
            onPress={handleBackup}
            style={{ marginBottom: 12 }}
          />

          <Button
            title={checkingUpdate ? 'Checking for Updates...' : 'Check for App Update (OTA)'}
            variant="outline"
            onPress={handleCheckForUpdate}
            disabled={checkingUpdate}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Reset All Local Data"
            variant="secondary"
            onPress={handleResetApp}
          />
        </Card>

        {/* App Info */}
        <View style={styles.footerInfo}>
          <Text style={[styles.appName, { color: colors.primary }]}>619 — Discipline Daily</Text>
          <Text style={[styles.appVersion, { color: colors.secondaryText }]}>Version 1.3.0</Text>
          <Text style={[styles.appTagline, { color: colors.mutedText }]}>Royal Emerald & Gold Theme • Habit Hub Social Suite</Text>
        </View>

        {/* Edit Username Modal */}
        <Modal visible={usernameModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Update Username</Text>
              <Text style={[styles.modalSub, { color: colors.secondaryText }]}>
                Usernames can only be changed once every 60 days.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>New Username *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. usman_haider"
                autoCapitalize="none"
                placeholderTextColor={colors.mutedText}
                value={newUsername}
                onChangeText={setNewUsername}
              />

              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setUsernameModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Update Username"
                  variant="primary"
                  loading={updatingUsername}
                  onPress={handleSaveUsername}
                  style={{ flex: 2, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>
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
    padding: 18,
    marginBottom: 16,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  handleChip: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  userHandle: {
    fontSize: 13,
    fontWeight: '800',
  },
  userSub: {
    fontSize: 12,
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
