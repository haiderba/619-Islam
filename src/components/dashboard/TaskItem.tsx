import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { Goal } from '../../types/goal';

interface TaskItemProps {
  goal: Goal;
  completed: boolean;
  onToggle: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ goal, completed, onToggle }) => {
  const { colors } = useTheme();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Islamic':
        return colors.accentGold;
      case 'Health':
        return colors.primary;
      case 'Fitness':
        return colors.warning;
      case 'Learning':
        return colors.accentCyan;
      default:
        return colors.secondaryText;
    }
  };

  return (
    <Card style={[styles.card, completed && styles.completedCard]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={styles.container}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.secondaryText },
            completed && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              completed && { textDecorationLine: 'line-through', color: colors.secondaryText },
            ]}
          >
            {goal.title}
          </Text>
          {goal.description ? (
            <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={1}>
              {goal.description}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.categoryTag,
            { borderColor: getCategoryColor(goal.category) },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: getCategoryColor(goal.category) },
            ]}
          >
            {goal.category}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    padding: 14,
  },
  completedCard: {
    opacity: 0.6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryTag: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
