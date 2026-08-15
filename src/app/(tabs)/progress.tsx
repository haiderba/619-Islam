import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { useStreak } from '@/hooks/useStreak';
import { useGoals } from '@/hooks/useGoals';
import { getPastNDays, formatDateFormatted } from '@/utils/dateUtils';
import { StorageService } from '@/services/storageService';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { streakData, refreshStreak } = useStreak();
  const { goals, refreshGoals } = useGoals();

  const [past7DaysStats, setPast7DaysStats] = useState<{ date: string; label: string; count: number }[]>([]);
  const [totalCompletedCount, setTotalCompletedCount] = useState(0);

  const loadAnalytics = useCallback(async () => {
    const dates = getPastNDays(7);
    const allCompletions = await StorageService.getCompletions();

    const stats = dates.map((d: string) => {
      const dayCompletions = allCompletions.filter((c: any) => c.date === d && c.completed);
      return {
        date: d,
        label: formatDateFormatted(d).split(',')[0],
        count: dayCompletions.length,
      };
    });

    const totalDone = allCompletions.filter((c: any) => c.completed).length;
    setPast7DaysStats(stats);
    setTotalCompletedCount(totalDone);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStreak();
      refreshGoals();
      loadAnalytics();
    }, [refreshStreak, refreshGoals, loadAnalytics])
  );

  const maxDailyCount = Math.max(1, ...past7DaysStats.map((s) => s.count));

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);
  const bottomInset = Math.max(insets.bottom + 105, 120);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader 
        title="Progress" 
        subtitle="Track your discipline and consistency" 
        topInset={topInset}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshStreak();
              refreshGoals();
              loadAnalytics();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Streak Overview Grid */}
        <View style={styles.statsGrid}>
          <Card variant="goldGlow" style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statNumber, { color: colors.accentGold }]}>{streakData.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Current Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{streakData.longestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Best Streak</Text>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{goals.length}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Active Goals</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{totalCompletedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Total Completed</Text>
          </Card>
        </View>

        {/* 7-Day Completion Trend Chart */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>7-Day Completion Trend</Text>
        <Card style={styles.chartCard}>
          <View style={styles.barChartContainer}>
            {past7DaysStats.map((item, idx) => {
              const heightPercent = (item.count / maxDailyCount) * 100;
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={[styles.barCountText, { color: colors.primary }]}>{item.count > 0 ? item.count : ''}</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.surface }]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${Math.max(8, heightPercent)}%`, backgroundColor: colors.border },
                        item.count > 0 && { backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.secondaryText }]}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Motivation Card */}
        <Card variant="surface" style={styles.motivationCard}>
          <Text style={[styles.motivationTitle, { color: colors.primary }]}>Keep the Discipline Daily</Text>
          <Text style={[styles.motivationDesc, { color: colors.secondaryText }]}>
            Consistency in small habits creates lifelong transformations. Your commitment to both Deen & Dunya elevates your life.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  chartCard: {
    padding: 20,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barCountText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 90,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  motivationCard: {
    marginTop: 20,
    padding: 20,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  motivationDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
});
