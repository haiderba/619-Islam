import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { PrayerTimesCard } from '@/components/islamic/PrayerTimesCard';
import { QiblaCompass } from '@/components/islamic/QiblaCompass';
import { TasbeehCounter } from '@/components/islamic/TasbeehCounter';
import { AdhkarReader } from '@/components/islamic/AdhkarReader';

type DeenSection = 'Prayer' | 'Qibla' | 'Tasbeeh' | 'Adhkar';

export default function DeenScreen() {
  const [activeSection, setActiveSection] = useState<DeenSection>('Prayer');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Segment Controls */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentScroll}>
          {(['Prayer', 'Qibla', 'Tasbeeh', 'Adhkar'] as DeenSection[]).map((sec) => {
            const isSelected = activeSection === sec;
            return (
              <TouchableOpacity
                key={sec}
                activeOpacity={0.8}
                style={[
                  styles.segmentChip,
                  isSelected && styles.segmentChipSelected,
                ]}
                onPress={() => setActiveSection(sec)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextSelected,
                  ]}
                >
                  {sec === 'Prayer'
                    ? '🕌 Prayer Times'
                    : sec === 'Qibla'
                    ? '🧭 Qibla'
                    : sec === 'Tasbeeh'
                    ? '📿 Tasbeeh'
                    : '📜 Adhkar'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dynamic Section Render */}
        {activeSection === 'Prayer' && <PrayerTimesCard />}
        {activeSection === 'Qibla' && <QiblaCompass />}
        {activeSection === 'Tasbeeh' && <TasbeehCounter />}
        {activeSection === 'Adhkar' && <AdhkarReader />}
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
  segmentScroll: {
    marginBottom: 12,
  },
  segmentChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderColor: Colors.primary,
  },
  segmentText: {
    color: Colors.secondaryText,
    fontWeight: '600',
    fontSize: 13,
  },
  segmentTextSelected: {
    color: Colors.primaryLight,
    fontWeight: '800',
  },
});
