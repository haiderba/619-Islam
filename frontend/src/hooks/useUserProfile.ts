import { useState, useEffect } from 'react';
import { StorageService, DEFAULT_SETTINGS } from '../services/storageService';
import type { UserProfile, AppSettings } from '../types/user';
import { AuthService } from '../services/authService';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfileAndSettings = async () => {
    setLoading(true);
    try {
      const p = await AuthService.getUserProfile();
      setProfile(p as unknown as UserProfile);
    } catch {
      setProfile(null);
    }
    const s = await StorageService.getSettings();
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
