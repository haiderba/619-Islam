import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { HubMember, HubGoal, HubGoalCompletion } from '@/types/hub';

interface MemberProgressListProps {
  goal: HubGoal;
  members: HubMember[];
  completions: HubGoalCompletion[];
  currentUserId: string;
  onToggleMyCompletion: (goalId: string) => void;
}

export const MemberProgressList: React.FC<MemberProgressListProps> = ({
  goal,
  members,
  completions,
  currentUserId,
  onToggleMyCompletion,
}) => {
  const { colors } = useTheme();

  const acceptedMembers = members.filter((m) => m.status === 'accepted');
  const completedUserIds = new Set(
    completions.filter((c) => c.hubGoalId === goal.id && c.completed).map((c) => c.userId)
  );

  const completedCount = acceptedMembers.filter((m) => completedUserIds.has(m.userId)).length;
  const totalCount = acceptedMembers.length;
  const isGroupFullyCompleted = totalCount > 0 && completedCount === totalCount;
  const isMyCompleted = completedUserIds.has(currentUserId);

  return (
    <Card
      style={[
        styles.card,
        isGroupFullyCompleted && { borderColor: colors.primary, borderWidth: 2 },
      ]}
    >
      {/* Group Goal Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
          {goal.description ? (
            <Text style={[styles.desc, { color: colors.secondaryText }]}>{goal.description}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggleMyCompletion(goal.id)}
          style={[
            styles.toggleBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isMyCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.toggleText, { color: isMyCompleted ? '#FFFFFF' : colors.text }]}>
            {isMyCompleted ? '✓ Done' : 'Mark Done'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar & Counter */}
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
          Group Progress: <Text style={{ color: colors.primary, fontWeight: '800' }}>{completedCount} / {totalCount}</Text>
        </Text>
        {isGroupFullyCompleted ? (
          <View style={[styles.allDoneBadge, { backgroundColor: colors.greenGlow }]}>
            <Text style={[styles.allDoneText, { color: colors.primary }]}>GROUP COMPLETED 🎉</Text>
          </View>
        ) : null}
      </View>

      {/* Member Avatars & Completion Status Grid */}
      <View style={styles.membersGrid}>
        {acceptedMembers.map((m) => {
          const done = completedUserIds.has(m.userId);
          return (
            <View
              key={m.userId}
              style={[
                styles.memberPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
                done && { borderColor: colors.primary, backgroundColor: colors.greenGlow },
              ]}
            >
              <Text style={[styles.memberCheck, { color: done ? colors.primary : colors.mutedText }]}>
                {done ? '✓' : '○'}
              </Text>
              <Text
                style={[
                  styles.memberName,
                  { color: colors.text },
                  done && { color: colors.primaryLight, fontWeight: '700' },
                ]}
              >
                @{m.username} {m.userId === currentUserId ? '(You)' : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    marginTop: 2,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  allDoneBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  allDoneText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  memberCheck: {
    fontSize: 14,
    fontWeight: '900',
    marginRight: 6,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
  },
});
