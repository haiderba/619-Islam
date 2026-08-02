import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { useStreak } from '@/hooks/useStreak';
import { useGoals } from '@/hooks/useGoals';
import { getPastNDays, formatDateFormatted } from '@/utils/dateUtils';
import { StorageService } from '@/services/storageService';

export default function ProgressScreen() {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshStreak();
              refreshGoals();
              loadAnalytics();
            }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Streak Overview Grid */}
        <View style={styles.statsGrid}>
          <Card variant="goldGlow" style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{streakData.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statNumber}>{streakData.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNumber}>{goals.length}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{totalCompletedCount}</Text>
            <Text style={styles.statLabel}>Total Completed</Text>
          </Card>
        </View>

        {/* 7-Day Completion Trend Chart */}
        <Text style={styles.sectionTitle}>7-Day Completion Trend</Text>
        <Card style={styles.chartCard}>
          <View style={styles.barChartContainer}>
            {past7DaysStats.map((item, idx) => {
              const heightPercent = (item.count / maxDailyCount) * 100;
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={styles.barCountText}>{item.count > 0 ? item.count : ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${Math.max(8, heightPercent)}%` },
                        item.count > 0 && styles.barFillActive,
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Motivation Card */}
        <Card variant="surface" style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>Keep the Discipline Daily</Text>
          <Text style={styles.motivationDesc}>
            Consistency in small habits creates lifelong transformations. Your commitment to both Deen & Dunya elevates your life.
          </Text>
        </Card>
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
    padding: 16,
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
    color: Colors.primary,
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.secondaryText,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.text,
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
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 90,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: Colors.border,
    borderRadius: 12,
  },
  barFillActive: {
    backgroundColor: Colors.primary,
  },
  barLabel: {
    color: Colors.secondaryText,
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  motivationCard: {
    marginTop: 20,
    padding: 20,
  },
  motivationTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  motivationDesc: {
    color: Colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },
});
