import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { StorageService } from '@/services/storageService';
import { AppTheme } from '@/types/user';

export interface ColorPalette {
  isDark: boolean;
  background: string;
  card: string;
  cardBorder: string;
  surface: string;
  surfaceHighlight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accentGold: string;
  accentGoldLight: string;
  accentCyan: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  greenGlow: string;
  goldGlow: string;
  goldGlowBorder: string;
  gradientColors: string[];
}

// Warm Obsidian & Navy (Dark Mode)
export const DarkPalette: ColorPalette = {
  isDark: true,
  background: '#0F172A',
  card: '#1E293B',
  cardBorder: '#334155',
  surface: '#1E293B',
  surfaceHighlight: '#334155',
  primary: '#F97316', // Orange highlight
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  accentGold: '#F59E0B',
  accentGoldLight: '#FBBF24',
  accentCyan: '#06B6D4',
  text: '#F8FAFC',
  secondaryText: '#94A3B8',
  mutedText: '#64748B',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  greenGlow: 'rgba(249, 115, 22, 0.1)',
  goldGlow: 'rgba(245, 158, 11, 0.16)',
  goldGlowBorder: 'rgba(245, 158, 11, 0.35)',
  gradientColors: ['#1E293B', '#0F172A', '#020617'],
};

// Clean Warm Cream & White (Light Mode)
export const LightPalette: ColorPalette = {
  isDark: false,
  background: '#FDFCFB', // Very warm cream background
  card: '#FFFFFF',       // Pure white cards for contrast
  cardBorder: '#F3E8DF',
  surface: '#F9F5F1',
  surfaceHighlight: '#F3E8DF',
  primary: '#F97316',    // Vibrant Orange
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  accentGold: '#F59E0B',
  accentGoldLight: '#FBBF24',
  accentCyan: '#0891B2',
  text: '#111827',
  secondaryText: '#4B5563',
  mutedText: '#9CA3AF',
  border: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#DC2626',
  greenGlow: 'rgba(249, 115, 22, 0.08)',
  goldGlow: 'rgba(245, 158, 11, 0.08)',
  goldGlowBorder: 'rgba(245, 158, 11, 0.2)',
  gradientColors: ['#FFF7ED', '#FFEDD5', '#FED7AA'], // Warm orange gradient
};

interface ThemeContextType {
  themeMode: AppTheme;
  colors: ColorPalette;
  setThemeMode: (mode: AppTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'Dark',
  colors: DarkPalette,
  setThemeMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<AppTheme>('Dark');

  useEffect(() => {
    async function loadTheme() {
      const settings = await StorageService.getSettings();
      if (settings?.theme) {
        setThemeModeState(settings.theme);
      }
    }
    loadTheme();
  }, []);

  const setThemeMode = async (mode: AppTheme) => {
    setThemeModeState(mode);
    const currentSettings = await StorageService.getSettings();
    await StorageService.saveSettings({ ...currentSettings, theme: mode });
  };

  const isEffectiveDark =
    themeMode === 'Dark' || (themeMode === 'System' && deviceScheme === 'dark');

  const colors = isEffectiveDark ? DarkPalette : LightPalette;

  return (
    <ThemeContext.Provider value={{ themeMode, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
