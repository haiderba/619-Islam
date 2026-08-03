import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { getDailyQuranQuote } from '@/constants/versesAndHadiths';
import { DailyVerseCard } from '@/components/dashboard/DailyVerseCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useUserProfile();
  const { goals, completions, toggleTask, refreshGoals } = useGoals();
  const { streakData, refreshStreak } = useStreak();

  useFocusEffect(
    useCallback(() => {
      refreshGoals();
      refreshStreak();
    }, [refreshGoals, refreshStreak])
  );

  const dailyQuote = getDailyQuranQuote();

  const completedGoalIds = new Set(
    completions.filter((c) => c.completed).map((c) => c.goalId)
  );

  const totalTasks = goals.length;
  const completedTasks = goals.filter((g) => completedGoalIds.has(g.id)).length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);
  const bottomInset = Math.max(insets.bottom + 105, 120);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 8, paddingBottom: bottomInset },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshGoals();
              refreshStreak();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Header & Greeting */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.greetingSub, { color: colors.secondaryText }]}>Assalamu Alaikum,</Text>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {profile?.name || 'Friend'}
            </Text>
          </View>
          <StreakBadge streak={streakData.currentStreak} />
        </View>

        {/* Daily Quran Quote Card (Arabic, Urdu, English & Export as PNG) */}
        <DailyVerseCard quote={dailyQuote} />

        {/* Today's Overview Ring Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <ProgressRing
              percentage={percentage}
              size={120}
              subLabel="COMPLETED"
              progressColor={colors.primary}
            />
            <View style={styles.overviewStats}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {completedTasks} / {totalTasks}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Tasks Done Today</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.challengeText, { color: colors.text }]}>Day 7 / 40 Challenge</Text>
            </View>
          </View>
        </Card>

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/goal/create')}>
            <Text style={[styles.addGoalLink, { color: colors.primary }]}>+ Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No goals set for today</Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
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
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
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
    flexWrap: 'wrap',
  },
  overviewStats: {
    alignItems: 'center',
    flexShrink: 1,
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: 100,
    marginVertical: 10,
  },
  challengeText: {
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
    fontSize: 18,
    fontWeight: '700',
  },
  addGoalLink: {
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
