import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { HabitHub, HubMember } from '@/types/hub';
import { HubService } from '@/services/hubService';

interface PendingInviteCardProps {
  hub: HabitHub;
  member: HubMember;
  onRespond: () => void;
}

export const PendingInviteCard: React.FC<PendingInviteCardProps> = ({ hub, member, onRespond }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleAction = async (accept: boolean) => {
    setLoading(true);
    try {
      await HubService.respondToInvite(hub.id, accept);
      onRespond();
    } catch (e) {
      console.error('Failed to respond to invite:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="goldGlow" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>📩</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { color: colors.text }]}>{hub.name}</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Invited by <Text style={{ color: colors.accentGold, fontWeight: '800' }}>@{hub.ownerUsername}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Decline"
          variant="secondary"
          size="small"
          disabled={loading}
          onPress={() => handleAction(false)}
          style={{ flex: 1, marginRight: 6 }}
        />
        <Button
          title="Accept Invite ✓"
          variant="primary"
          size="small"
          loading={loading}
          onPress={() => handleAction(true)}
          style={{ flex: 1, marginLeft: 6 }}
        />
      </View>
    </Card>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
