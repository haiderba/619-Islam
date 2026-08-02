import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { HabitHub } from '@/types/hub';

interface HubCardProps {
  hub: HabitHub;
  onPress: () => void;
}

export const HubCard: React.FC<HubCardProps> = ({ hub, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{hub.name}</Text>
          <View style={[styles.ownerBadge, { backgroundColor: colors.greenGlow, borderColor: colors.primary }]}>
            <Text style={[styles.ownerText, { color: colors.primary }]}>@{hub.ownerUsername}</Text>
          </View>
        </View>

        {hub.description ? (
          <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
            {hub.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={[styles.memberText, { color: colors.accentGold }]}>👥 Group Habit Circle</Text>
          <Text style={[styles.actionText, { color: colors.primary }]}>View Hub →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    padding: 16,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  ownerBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  ownerText: {
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  memberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
