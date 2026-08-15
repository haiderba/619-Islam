import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  topInset?: number;
}

export function ScreenHeader({ title, subtitle, rightAction, topInset = 0 }: ScreenHeaderProps) {
  const { colors, themeMode } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={colors.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: themeMode === 'Dark' ? colors.text : '#50301E' }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: themeMode === 'Dark' ? colors.secondaryText : '#8B5A2B' }]}>{subtitle}</Text>}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  rightAction: {
    marginLeft: 16,
  },
});
