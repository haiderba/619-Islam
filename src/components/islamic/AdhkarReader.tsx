import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { ADHKAR_DATA } from '@/constants/adhkarData';

type CategoryFilter = 'Morning' | 'Evening' | 'PostPrayer';

export const AdhkarReader: React.FC = () => {
  const { colors } = useTheme();
  const [selectedCat, setSelectedCat] = useState<CategoryFilter>('Morning');
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});

  const list = ADHKAR_DATA.filter((item) => item.category === selectedCat);

  const handleDecrement = (id: string, max: number) => {
    const current = completedCounts[id] ?? max;
    if (current > 0) {
      setCompletedCounts({
        ...completedCounts,
        [id]: current - 1,
      });
    }
  };

  return (
    <Card style={styles.container}>
      {/* Category Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>📜 Daily Adhkar</Text>
      </View>

      <View style={styles.tabRow}>
        {(['Morning', 'Evening', 'PostPrayer'] as CategoryFilter[]).map((cat) => {
          const isSelected = selectedCat === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              style={[
                styles.tab,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { backgroundColor: colors.greenGlow, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.secondaryText },
                  isSelected && { color: colors.primaryLight, fontWeight: '800' },
                ]}
              >
                {cat === 'Morning' ? '🌅 Morning' : cat === 'Evening' ? '🌆 Evening' : '🕌 Post-Prayer'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Adhkar Cards List */}
      {list.map((item) => {
        const remaining = completedCounts[item.id] ?? item.count;
        const isDone = remaining === 0;

        return (
          <View
            key={item.id}
            style={[
              styles.adhkarCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDone && { opacity: 0.6, borderColor: colors.success },
            ]}
          >
            {/* Arabic Text */}
            <Text style={[styles.arabicText, { color: colors.accentGold }]}>{item.arabic}</Text>

            {/* Transliteration */}
            {item.transliteration ? (
              <Text style={[styles.transliterationText, { color: colors.primaryLight }]}>{item.transliteration}</Text>
            ) : null}

            {/* Urdu Translation */}
            <Text style={[styles.urduText, { color: colors.text }]}>{item.urdu}</Text>

            {/* English Translation */}
            <Text style={[styles.englishText, { color: colors.secondaryText }]}>{item.english}</Text>

            {/* Counter Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDecrement(item.id, item.count)}
              disabled={isDone}
              style={[
                styles.countBtn,
                { backgroundColor: colors.greenGlow, borderColor: colors.primary },
                isDone && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: colors.success },
              ]}
            >
              <Text
                style={[
                  styles.countBtnText,
                  { color: colors.primaryLight },
                  isDone && { color: colors.success, fontWeight: '800' },
                ]}
              >
                {isDone ? 'Completed ✓' : `${remaining}x Remaining — Tap to Recite`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 20,
    borderRadius: 24,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  adhkarCard: {
    marginVertical: 6,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },
  transliterationText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 6,
  },
  urduText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  englishText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  countBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  countBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
