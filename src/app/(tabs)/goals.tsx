import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useGoals } from '@/hooks/useGoals';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalCategory, Goal } from '@/types/goal';
import { ISLAMIC_TEMPLATES, GENERAL_TEMPLATES, GoalTemplate } from '@/constants/templates';

const CATEGORIES: (GoalCategory | 'All')[] = [
  'All',
  'Islamic',
  'Health',
  'Learning',
  'Career',
  'Fitness',
];

export default function GoalsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { goals, addGoal, deleteGoal, refreshGoals } = useGoals();
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'All'>('All');

  useFocusEffect(
    useCallback(() => {
      refreshGoals();
    }, [refreshGoals])
  );

  const filteredGoals = goals.filter((g) =>
    selectedCategory === 'All' ? true : g.category === selectedCategory
  );

  const handleAddTemplate = async (template: GoalTemplate) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: template.title,
      category: template.category,
      description: template.description,
      repeatType: template.repeatType,
      reminderFrequency: template.reminderFrequency,
      notificationMode: template.notificationMode,
      createdAt: new Date().toISOString(),
    };
    await addGoal(newGoal);
    Alert.alert('Goal Added', `"${template.title}" has been added to your daily goals.`);
  };

  const handleDeleteGoal = (goalId: string, title: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGoal(goalId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.greenGlow, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.secondaryText },
                    isSelected && { color: colors.primaryLight, fontWeight: '800' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Add Goal Button */}
        <Button
          title="+ Create Custom Goal"
          onPress={() => router.push('/goal/create')}
          style={{ marginVertical: 14 }}
        />

        {/* Active Goals Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Active Goals ({filteredGoals.length})
        </Text>

        {filteredGoals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No goals found in this category.</Text>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card key={goal.id} style={styles.goalCard}>
              <View style={styles.goalRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                  {goal.description ? (
                    <Text style={[styles.goalDesc, { color: colors.secondaryText }]}>{goal.description}</Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaBadge, { color: colors.primary }]}>{goal.category}</Text>
                    <Text style={[styles.metaText, { color: colors.secondaryText }]}>• {goal.repeatType}</Text>
                    <Text style={[styles.metaText, { color: colors.secondaryText }]}>• {goal.reminderFrequency}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteGoal(goal.id, goal.title)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        {/* Pre-built Templates Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Islamic Templates
        </Text>
        {ISLAMIC_TEMPLATES.map((tmpl) => (
          <Card key={tmpl.id} style={styles.templateCard}>
            <View style={styles.goalRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalTitle, { color: colors.text }]}>{tmpl.title}</Text>
                <Text style={[styles.goalDesc, { color: colors.secondaryText }]}>{tmpl.description}</Text>
              </View>
              <Button
                title="+ Add"
                size="small"
                variant="outline"
                onPress={() => handleAddTemplate(tmpl)}
              />
            </View>
          </Card>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          General Habit Templates
        </Text>
        {GENERAL_TEMPLATES.map((tmpl) => (
          <Card key={tmpl.id} style={styles.templateCard}>
            <View style={styles.goalRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalTitle, { color: colors.text }]}>{tmpl.title}</Text>
                <Text style={[styles.goalDesc, { color: colors.secondaryText }]}>{tmpl.description}</Text>
              </View>
              <Button
                title="+ Add"
                size="small"
                variant="outline"
                onPress={() => handleAddTemplate(tmpl)}
              />
            </View>
          </Card>
        ))}
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
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  goalCard: {
    marginVertical: 6,
    padding: 14,
  },
  templateCard: {
    marginVertical: 4,
    padding: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaBadge: {
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 11,
    marginLeft: 6,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
