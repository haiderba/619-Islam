import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PrayerTimesCard } from '@/components/islamic/PrayerTimesCard';
import { QiblaCompass } from '@/components/islamic/QiblaCompass';
import { TasbeehCounter } from '@/components/islamic/TasbeehCounter';
import { AdhkarReader } from '@/components/islamic/AdhkarReader';
import { QuranReader } from '@/components/islamic/QuranReader';

type DeenSection = 'Prayer' | 'Qibla' | 'Tasbeeh' | 'Adhkar' | 'Quran';

export default function DeenScreen() {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState<DeenSection>('Prayer');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* iOS Native Segmented Control */}
        <View style={[styles.segmentedContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(['Prayer', 'Qibla', 'Tasbeeh', 'Adhkar', 'Quran'] as DeenSection[]).map((sec) => {
            const isSelected = activeSection === sec;
            return (
              <TouchableOpacity
                key={sec}
                activeOpacity={0.8}
                style={[
                  styles.segmentItem,
                  isSelected && {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
                onPress={() => setActiveSection(sec)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: colors.secondaryText },
                    isSelected && { color: colors.primary, fontWeight: '800' },
                  ]}
                >
                  {sec === 'Prayer'
                    ? '🕌 Prayer'
                    : sec === 'Qibla'
                    ? '🧭 Qibla'
                    : sec === 'Tasbeeh'
                    ? '📿 Tasbeeh'
                    : sec === 'Adhkar'
                    ? '📜 Adhkar'
                    : '📖 Quran'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Section Render */}
        {activeSection === 'Prayer' && <PrayerTimesCard />}
        {activeSection === 'Qibla' && <QiblaCompass />}
        {activeSection === 'Tasbeeh' && <TasbeehCounter />}
        {activeSection === 'Adhkar' && <AdhkarReader />}
        {activeSection === 'Quran' && <QuranReader />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
