import { useState, useEffect } from 'react';
import { StorageService, DEFAULT_SETTINGS } from '../services/storageService';
import { UserProfile, AppSettings } from '../types/user';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfileAndSettings = async () => {
    setLoading(true);
    const p = await StorageService.getUserProfile();
    const s = await StorageService.getSettings();
    setProfile(p);
    setSettings(s);
    setLoading(false);
  };

  useEffect(() => {
    loadProfileAndSettings();
  }, []);

  const saveProfile = async (newProfile: UserProfile) => {
    await StorageService.saveUserProfile(newProfile);
    setProfile(newProfile);
  };

  const saveSettings = async (newSettings: AppSettings) => {
    await StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  return {
    profile,
    settings,
    loading,
    saveProfile,
    saveSettings,
    refreshProfile: loadProfileAndSettings,
  };
}
