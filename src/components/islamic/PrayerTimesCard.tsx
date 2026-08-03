import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { calculatePrayerTimes, PrayerTime } from '@/utils/prayerTimesUtils';
import { getHijriDate } from '@/utils/hijriCalendarUtils';

export const PrayerTimesCard: React.FC = () => {
  const { colors } = useTheme();
  const [schedule, setSchedule] = useState<PrayerTime[]>([]);
  const [hijriDateStr, setHijriDateStr] = useState<string>('');
  const [nextPrayerName, setNextPrayerName] = useState<string>('Fajr');

  useEffect(() => {
    const times = calculatePrayerTimes();
    setSchedule(times);
    setHijriDateStr(getHijriDate().formatted);

    const nextP = times.find((p) => p.isNext);
    if (nextP) setNextPrayerName(nextP.name);
  }, []);

  return (
    <Card style={styles.card}>
      {/* Header Row with Hijri Date */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>🕌 Prayer Timings</Text>
          <Text style={[styles.hijriText, { color: colors.accentGold }]}>{hijriDateStr}</Text>
        </View>
        <View style={[styles.nextBadge, { backgroundColor: colors.greenGlow, borderColor: colors.primary }]}>
          <Text style={[styles.nextBadgeText, { color: colors.primary }]}>NEXT: {nextPrayerName.toUpperCase()}</Text>
        </View>
      </View>

      {/* 6 Prayer Times Grid */}
      <View style={styles.grid}>
        {schedule.map((item) => (
          <View
            key={item.name}
            style={[
              styles.prayerBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
              item.isNext && {
                backgroundColor: colors.greenGlow,
                borderColor: colors.primary,
                borderWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.prayerName,
                { color: colors.secondaryText },
                item.isNext && { color: colors.primaryLight, fontWeight: '800' },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.prayerTime,
                { color: colors.text },
                item.isNext && { color: colors.primary, fontWeight: '900', fontSize: 16 },
              ]}
            >
              {item.time}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    padding: 20,
    borderRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hijriText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  nextBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  nextBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerBox: {
    width: '31.5%',
    minHeight: 68,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  prayerName: {
    fontSize: 12,
    fontWeight: '600',
  },
  prayerTime: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'center',
  },
});
