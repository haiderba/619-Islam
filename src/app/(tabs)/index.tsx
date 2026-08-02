import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { getDailyReminder } from '@/constants/versesAndHadiths';
import { DailyVerseCard } from '@/components/dashboard/DailyVerseCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const { goals, completions, toggleTask, refreshGoals } = useGoals();
  const { streakData, refreshStreak } = useStreak();

  useFocusEffect(
    useCallback(() => {
      refreshGoals();
      refreshStreak();
    }, [refreshGoals, refreshStreak])
  );

  const dailyReminder = getDailyReminder();

  const completedGoalIds = new Set(
    completions.filter((c) => c.completed).map((c) => c.goalId)
  );

  const totalTasks = goals.length;
  const completedTasks = goals.filter((g) => completedGoalIds.has(g.id)).length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshGoals();
              refreshStreak();
            }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Top Header & Greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingSub}>Assalamu Alaikum,</Text>
            <Text style={styles.userName}>{profile?.name || 'Friend'}</Text>
          </View>
          <StreakBadge streak={streakData.currentStreak} />
        </View>

        {/* Daily Quran Verse / Hadith Card */}
        <DailyVerseCard reminder={dailyReminder} />

        {/* Today's Overview Ring Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <ProgressRing
              percentage={percentage}
              size={120}
              subLabel="COMPLETED"
            />
            <View style={styles.overviewStats}>
              <Text style={styles.statNumber}>
                {completedTasks} / {totalTasks}
              </Text>
              <Text style={styles.statLabel}>Tasks Done Today</Text>
              <View style={styles.divider} />
              <Text style={styles.challengeText}>Day 7 / 40 Challenge</Text>
            </View>
          </View>
        </Card>

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/goal/create')}>
            <Text style={styles.addGoalLink}>+ Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No goals set for today</Text>
            <Text style={styles.emptySubtitle}>
              Start building discipline in Deen & Dunya by creating your first goal or choosing a template.
            </Text>
            <Button
              title="Create First Goal"
              onPress={() => router.push('/goal/create')}
              style={{ marginTop: 16 }}
            />
          </Card>
        ) : (
          goals.map((goal) => (
            <TaskItem
              key={goal.id}
              goal={goal}
              completed={completedGoalIds.has(goal.id)}
              onToggle={() => toggleTask(goal.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  overviewCard: {
    marginVertical: 12,
    padding: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  overviewStats: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.secondaryText,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    width: 100,
    marginVertical: 10,
  },
  challengeText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  addGoalLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: Colors.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
