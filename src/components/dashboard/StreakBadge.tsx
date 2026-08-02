import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: colors.goldGlow, borderColor: colors.goldGlowBorder }]}>
      <Text style={styles.flameIcon}>🔥</Text>
      <Text style={[styles.streakText, { color: colors.accentGold }]}>{streak} Day Streak</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  flameIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  streakText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
