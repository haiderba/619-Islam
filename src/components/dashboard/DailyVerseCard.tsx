import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { IslamicReminder } from '../../constants/versesAndHadiths';

interface DailyVerseCardProps {
  reminder: IslamicReminder;
}

export const DailyVerseCard: React.FC<DailyVerseCardProps> = ({ reminder }) => {
  return (
    <Card variant="goldGlow" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{reminder.type === 'Verse' ? '📖 Daily Quran Verse' : '✨ Daily Hadith'}</Text>
        </View>
      </View>
      <Text style={styles.quoteText}>"{reminder.text}"</Text>
      <Text style={styles.sourceText}>— {reminder.source}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  typeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    color: Colors.text,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginVertical: 6,
  },
  sourceText: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
});
