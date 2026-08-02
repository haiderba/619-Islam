import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.flameIcon}>🔥</Text>
      <Text style={styles.streakText}>{streak} Day Streak</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: Colors.goldGlowBorder,
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
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
