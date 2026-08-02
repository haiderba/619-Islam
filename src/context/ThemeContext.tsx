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

export const DarkPalette: ColorPalette = {
  isDark: true,
  background: '#000000', // Pure Black Background
  card: '#121212', // Deep Dark Card
  cardBorder: 'rgba(16, 185, 129, 0.3)', // Emerald Light Green Specular Border
  surface: '#1A1A1A',
  surfaceHighlight: '#262626',
  primary: '#10B981', // Vibrant Emerald / Light Green
  primaryLight: '#34D399', // Mint Light Green
  primaryDark: '#059669',
  accentGold: '#D4AF37', // Gold Accent
  accentCyan: '#06B6D4',
  text: '#FFFFFF', // Pure White Text
  secondaryText: '#A1A1AA',
  mutedText: '#71717A',
  border: '#27272A',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  greenGlow: 'rgba(16, 185, 129, 0.15)',
  goldGlow: 'rgba(212, 175, 55, 0.15)',
  goldGlowBorder: 'rgba(212, 175, 55, 0.35)',
};

export const LightPalette: ColorPalette = {
  isDark: false,
  background: '#F8FAFC', // Clean Soft White Background
  card: '#FFFFFF', // Crisp White Card
  cardBorder: 'rgba(16, 185, 129, 0.25)', // Light Green Border
  surface: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',
  primary: '#059669', // Emerald Green
  primaryLight: '#10B981', // Light Green Accent
  primaryDark: '#047857',
  accentGold: '#D4AF37', // Gold Accent
  accentCyan: '#0891B2',
  text: '#0F172A', // Dark Text for high contrast
  secondaryText: '#475569',
  mutedText: '#94A3B8',
  border: '#E2E8F0',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  greenGlow: 'rgba(16, 185, 129, 0.12)',
  goldGlow: 'rgba(212, 175, 55, 0.12)',
  goldGlowBorder: 'rgba(212, 175, 55, 0.3)',
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
