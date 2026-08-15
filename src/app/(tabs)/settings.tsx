import React, { useState, useRef } from 'react';
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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LocationPickerModal, LocationOption } from '@/components/ui/LocationPickerModal';
import { Country, State, City } from 'country-state-city';
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
  
  const scrollViewRef = useRef<ScrollView>(null);

  const [sound, setSound] = useState(settings.soundEnabled);
  const [vibration, setVibration] = useState(settings.vibrationEnabled);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);

  // Location & Time Settings
  const [locationMode, setLocationMode] = useState(settings.locationMode || 'auto');
  const [timezone, setTimezone] = useState(settings.timezone || 'auto');
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat || '12hr');
  const [country, setCountry] = useState(settings.manualLocation?.country || '');
  const [countryCode, setCountryCode] = useState('');
  const [stateLoc, setStateLoc] = useState(settings.manualLocation?.state || '');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState(settings.manualLocation?.city || '');
  const [area, setArea] = useState(settings.manualLocation?.area || '');
  
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    type: 'country' | 'city' | 'area';
    title: string;
    placeholder: string;
    options: LocationOption[];
  }>({
    visible: false,
    type: 'country',
    title: '',
    placeholder: '',
    options: [],
  });

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
    if (locationMode === 'manual' && (!country || !city)) {
      Alert.alert('Incomplete Location', 'Please provide at least a Country and City.');
      return;
    }

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

  const saveLocationSettings = () => {
    saveSettings({
      ...settings,
      locationMode: locationMode as any,
      timezone: timezone,
      timeFormat: timeFormat as any,
      manualLocation: locationMode === 'manual' ? { country, state: stateLoc, city, area } : null
    });
    Alert.alert('Settings Saved', 'Your location and time settings have been updated.');
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

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);
  const bottomInset = Math.max(insets.bottom + 105, 120);

  const openCountryPicker = () => {
    const countries = Country.getAllCountries().map(c => ({ id: c.isoCode, name: c.name }));
    setPickerConfig({
      visible: true,
      type: 'country',
      title: 'Select Country',
      placeholder: 'Search countries...',
      options: countries,
    });
  };

  const openStatePicker = () => {
    if (!countryCode) {
      Alert.alert('Required', 'Please select a Country first.');
      return;
    }
    const states = State.getStatesOfCountry(countryCode).map(s => ({ id: s.isoCode, name: s.name }));
    setPickerConfig({
      visible: true,
      type: 'area', // using area internally as the type for State since we removed it from the enum
      title: 'Select State/Province',
      placeholder: 'Search states...',
      options: states,
    });
  };

  const openCityPicker = () => {
    if (!countryCode || !stateCode) {
      Alert.alert('Required', 'Please select a State first.');
      return;
    }
    const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({ id: c.name, name: c.name }));
    setPickerConfig({
      visible: true,
      type: 'city',
      title: 'Select City',
      placeholder: 'Search cities...',
      options: cities,
    });
  };

  const handleLocationSelect = (option: LocationOption) => {
    if (pickerConfig.type === 'country') {
      setCountry(option.name);
      setCountryCode(option.id);
      setStateLoc('');
      setStateCode('');
      setCity('');
    } else if (pickerConfig.type === 'area') {
      // Area is now used as State internally
      setStateLoc(option.name);
      setStateCode(option.id);
      setCity('');
    } else if (pickerConfig.type === 'city') {
      setCity(option.name);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Peach Header */}
      <View style={[styles.headerSection, { paddingTop: topInset + 12 }]}>
        <LinearGradient
          colors={['#FFF1E6', '#FDCBB1']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
             <ChevronLeft color="#1F2937" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset },
        ]}
      >
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
                {user?.displayName || profile?.name || 'Guest User'}
              </Text>
              
              {user ? (
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
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }}
                  style={styles.handleChip}
                >
                  <Text style={[styles.userHandle, { color: colors.primary }]}>
                    Sign up to join habits 🚀
                  </Text>
                </TouchableOpacity>
              )}
              
              <Text style={[styles.userSub, { color: colors.secondaryText }]}>
                {user?.email || 'Not logged in'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Admin Panel Link */}
        {user?.role === 'admin' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Administrative</Text>
            <Card variant="greenGlow" style={styles.card}>
              <TouchableOpacity
                style={styles.adminRow}
                onPress={() => router.push('/(admin)')}
              >
                <View style={styles.adminIconContainer}>
                  <ShieldCheck color={colors.primary} size={24} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Admin Dashboard</Text>
                  <Text style={[styles.rowSub, { color: colors.secondaryText }]}>
                    Manage habits, users, and app content.
                  </Text>
                </View>
                <ChevronLeft size={20} color={colors.secondaryText} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </Card>
          </>
        )}

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

        {/* Location & Time Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Time</Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Location Mode</Text>
              <Text style={[styles.rowSub, { color: colors.secondaryText }]}>
                {locationMode === 'auto' ? 'GPS Auto-detect' : 'Manual Entry'}
              </Text>
            </View>
            <Switch
              value={locationMode === 'auto'}
              onValueChange={(val) => setLocationMode(val ? 'auto' : 'manual')}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {locationMode === 'manual' && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 0 }]}>Country</Text>
              <TouchableOpacity
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 12, justifyContent: 'center' }]}
                onPress={openCountryPicker}
              >
                <Text style={{ color: country ? colors.text : colors.mutedText }}>
                  {country || 'Select Country'}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 0 }]}>State / Province</Text>
              <TouchableOpacity
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 12, justifyContent: 'center' }]}
                onPress={openStatePicker}
              >
                <Text style={{ color: stateLoc ? colors.text : colors.mutedText }}>
                  {stateLoc || 'Select State/Province'}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 0 }]}>City</Text>
              <TouchableOpacity
                style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 12, justifyContent: 'center' }]}
                onPress={openCityPicker}
              >
                <Text style={{ color: city ? colors.text : colors.mutedText }}>
                  {city || 'Select City'}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 0 }]}>Area / Locality (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Phase 6"
                placeholderTextColor={colors.mutedText}
                value={area}
                onChangeText={setArea}
              />
            </View>
          )}

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Time Format</Text>
              <Text style={[styles.rowSub, { color: colors.secondaryText }]}>
                {timeFormat === '12hr' ? '12-Hour (AM/PM)' : '24-Hour'}
              </Text>
            </View>
            <Switch
              value={timeFormat === '24hr'}
              onValueChange={(val) => setTimeFormat(val ? '24hr' : '12hr')}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <Button
            title="Save Location & Time"
            variant="primary"
            onPress={saveLocationSettings}
            style={{ marginTop: 16 }}
          />
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
      <LocationPickerModal
        visible={pickerConfig.visible}
        title={pickerConfig.title}
        placeholder={pickerConfig.placeholder}
        options={pickerConfig.options}
        onClose={() => setPickerConfig(prev => ({ ...prev, visible: false }))}
        onSelect={handleLocationSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 1,
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
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  adminIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
