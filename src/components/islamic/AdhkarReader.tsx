import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { ADHKAR_DATA, AdhkarItem } from '@/constants/adhkarData';

type CategoryFilter = 'Morning' | 'Evening' | 'PostPrayer';

export const AdhkarReader: React.FC = () => {
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
    <Card variant="glass" style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.header}>
        <Text style={styles.title}>📜 Daily Adhkar</Text>
      </View>

      <View style={styles.tabRow}>
        {(['Morning', 'Evening', 'PostPrayer'] as CategoryFilter[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.8}
            style={[
              styles.tab,
              selectedCat === cat && styles.tabSelected,
            ]}
            onPress={() => setSelectedCat(cat)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCat === cat && styles.tabTextSelected,
              ]}
            >
              {cat === 'Morning' ? '🌅 Morning' : cat === 'Evening' ? '🌆 Evening' : '🕌 Post-Prayer'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Adhkar Cards List */}
      {list.map((item) => {
        const remaining = completedCounts[item.id] ?? item.count;
        const isDone = remaining === 0;

        return (
          <Card key={item.id} style={[styles.adhkarCard, isDone && styles.doneCard]}>
            {/* Arabic Text */}
            <Text style={styles.arabicText}>{item.arabic}</Text>

            {/* Transliteration */}
            {item.transliteration ? (
              <Text style={styles.transliterationText}>{item.transliteration}</Text>
            ) : null}

            {/* Urdu Translation */}
            <Text style={styles.urduText}>{item.urdu}</Text>

            {/* English Translation */}
            <Text style={styles.englishText}>{item.english}</Text>

            {/* Counter Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDecrement(item.id, item.count)}
              disabled={isDone}
              style={[styles.countBtn, isDone && styles.doneBtn]}
            >
              <Text style={[styles.countBtnText, isDone && styles.doneBtnText]}>
                {isDone ? 'Completed ✓' : `${remaining}x Remaining — Tap to Recite`}
              </Text>
            </TouchableOpacity>
          </Card>
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: Colors.accentCyan,
  },
  tabText: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: Colors.accentCyan,
    fontWeight: '800',
  },
  adhkarCard: {
    marginVertical: 6,
    padding: 16,
    backgroundColor: Colors.surface,
  },
  doneCard: {
    opacity: 0.6,
    borderColor: Colors.success,
  },
  arabicText: {
    color: Colors.accentGold,
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },
  transliterationText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 6,
  },
  urduText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  englishText: {
    color: Colors.secondaryText,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  countBtn: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: Colors.success,
  },
  countBtnText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  doneBtnText: {
    color: Colors.success,
    fontWeight: '800',
  },
});
