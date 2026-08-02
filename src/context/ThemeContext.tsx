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
}

// Royal Obsidian Emerald & Antique Gold (Dark Mode)
export const DarkPalette: ColorPalette = {
  isDark: true,
  background: '#040D0A', // Deep Obsidian Emerald
  card: '#0B1C16', // Rich Emerald Surface
  cardBorder: 'rgba(212, 175, 55, 0.25)', // Filigree Antique Gold Border
  surface: '#122720',
  surfaceHighlight: '#1A332B',
  primary: '#10B981', // Vibrant Royal Emerald
  primaryLight: '#34D399', // Bright Mint
  primaryDark: '#059669',
  accentGold: '#EAB308', // Warm Antique Gold
  accentGoldLight: '#FDE047',
  accentCyan: '#06B6D4',
  text: '#F8FAFC', // Pure Crisp White
  secondaryText: '#94A3B8', // Muted Slate
  mutedText: '#64748B',
  border: 'rgba(255, 255, 255, 0.12)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  greenGlow: 'rgba(16, 185, 129, 0.18)',
  goldGlow: 'rgba(234, 179, 8, 0.16)',
  goldGlowBorder: 'rgba(234, 179, 8, 0.35)',
};

// Porcelain Emerald & Warm Gold (Light Mode)
export const LightPalette: ColorPalette = {
  isDark: false,
  background: '#F6F9F7', // Soft Porcelain Mint
  card: '#FFFFFF', // Pure White Card
  cardBorder: '#E2E8F0', // Soft Subtle Border
  surface: '#EDF4F0',
  surfaceHighlight: '#E2ECE6',
  primary: '#047857', // Deep Royal Emerald Green
  primaryLight: '#10B981', // Bright Emerald
  primaryDark: '#065F46',
  accentGold: '#B45309', // Warm Rich Gold
  accentGoldLight: '#D97706',
  accentCyan: '#0891B2',
  text: '#0F172A', // Deep Slate Charcoal (High Legibility)
  secondaryText: '#475569', // Slate Gray
  mutedText: '#94A3B8',
  border: '#E2E8F0',
  success: '#047857',
  warning: '#D97706',
  danger: '#DC2626',
  greenGlow: 'rgba(4, 120, 87, 0.1)',
  goldGlow: 'rgba(180, 83, 9, 0.1)',
  goldGlowBorder: 'rgba(180, 83, 9, 0.25)',
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
