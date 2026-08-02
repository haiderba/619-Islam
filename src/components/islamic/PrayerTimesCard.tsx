import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { calculatePrayerTimes, PrayerTime } from '@/utils/prayerTimesUtils';
import { getHijriDate } from '@/utils/hijriCalendarUtils';

export const PrayerTimesCard: React.FC = () => {
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
    <Card variant="glass" style={styles.card}>
      {/* Header Row with Hijri Date */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionHeaderTitle}>🕌 Prayer Times</Text>
          <Text style={styles.hijriText}>{hijriDateStr}</Text>
        </View>
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>Next: {nextPrayerName}</Text>
        </View>
      </View>

      {/* 5 Daily Prayers Grid */}
      <View style={styles.grid}>
        {schedule.map((item) => (
          <View
            key={item.name}
            style={[
              styles.prayerBox,
              item.isNext && styles.nextPrayerBox,
            ]}
          >
            <Text style={[styles.prayerName, item.isNext && styles.nextPrayerText]}>
              {item.name}
            </Text>
            <Text style={[styles.prayerTime, item.isNext && styles.nextPrayerTime]}>
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
    marginVertical: 12,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  hijriText: {
    color: Colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  nextBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accentCyan,
  },
  nextBadgeText: {
    color: Colors.accentCyan,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerBox: {
    width: '31%',
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextPrayerBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderColor: Colors.primary,
  },
  prayerName: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  nextPrayerText: {
    color: Colors.primaryLight,
    fontWeight: '800',
  },
  prayerTime: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  nextPrayerTime: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
