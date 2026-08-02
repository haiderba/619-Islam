import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { Goal } from '../../types/goal';

interface TaskItemProps {
  goal: Goal;
  completed: boolean;
  onToggle: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ goal, completed, onToggle }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Islamic':
        return Colors.primary;
      case 'Health':
        return Colors.success;
      case 'Fitness':
        return Colors.warning;
      case 'Learning':
        return '#3B82F6';
      default:
        return Colors.secondaryText;
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
            completed && styles.checkedBox,
          ]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.title, completed && styles.completedText]}>
            {goal.title}
          </Text>
          {goal.description ? (
            <Text style={styles.description} numberOfLines={1}>
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
    padding: 12,
  },
  completedCard: {
    opacity: 0.6,
    backgroundColor: Colors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryText,
  },
  description: {
    color: Colors.secondaryText,
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
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
