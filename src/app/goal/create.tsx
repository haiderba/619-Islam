import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useGoals } from '@/hooks/useGoals';
import { GoalCategory, RepeatType, NotificationMode, ReminderFrequency, Goal } from '@/types/goal';
import { Button } from '@/components/ui/Button';

const CATEGORIES: GoalCategory[] = ['Islamic', 'Health', 'Learning', 'Career', 'Fitness', 'Custom'];
const REPEAT_TYPES: RepeatType[] = ['Daily', 'Weekly', 'Custom'];
const FREQUENCIES: ReminderFrequency[] = ['15m', '30m', '1h', 'FixedTimes'];
const MODES: NotificationMode[] = ['Sound', 'Silent', 'Vibration'];

export default function CreateGoalScreen() {
  const router = useRouter();
  const { addGoal } = useGoals();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Islamic');
  const [repeatType, setRepeatType] = useState<RepeatType>('Daily');
  const [frequency, setFrequency] = useState<ReminderFrequency>('30m');
  const [startTime, setStartTime] = useState('07:00');
  const [mode, setMode] = useState<NotificationMode>('Sound');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setSubmitting(true);
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      category,
      description: description.trim(),
      repeatType,
      reminderFrequency: frequency,
      reminderStartTime: startTime,
      notificationMode: mode,
      createdAt: new Date().toISOString(),
    };

    await addGoal(newGoal);
    setSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Goal Title */}
        <Text style={styles.label}>Goal Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Recite Surah Mulk before sleep"
          placeholderTextColor={Colors.secondaryText}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Selector */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                category === cat && styles.chipSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description / Notes (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Add motivation or notes..."
          placeholderTextColor={Colors.secondaryText}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Repeat Frequency */}
        <Text style={styles.label}>Repeat Schedule</Text>
        <View style={styles.chipRow}>
          {REPEAT_TYPES.map((rep) => (
            <TouchableOpacity
              key={rep}
              style={[
                styles.chip,
                repeatType === rep && styles.chipSelected,
              ]}
              onPress={() => setRepeatType(rep)}
            >
              <Text
                style={[
                  styles.chipText,
                  repeatType === rep && styles.chipTextSelected,
                ]}
              >
                {rep}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder Frequency */}
        <Text style={styles.label}>Reminder Interval</Text>
        <View style={styles.chipRow}>
          {FREQUENCIES.map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.chip,
                frequency === freq && styles.chipSelected,
              ]}
              onPress={() => setFrequency(freq)}
            >
              <Text
                style={[
                  styles.chipText,
                  frequency === freq && styles.chipTextSelected,
                ]}
              >
                {freq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder Start Time */}
        <Text style={styles.label}>Reminder Start Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="07:00"
          placeholderTextColor={Colors.secondaryText}
          value={startTime}
          onChangeText={setStartTime}
        />

        {/* Notification Mode */}
        <Text style={styles.label}>Notification Alert Mode</Text>
        <View style={styles.chipRow}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.chip,
                mode === m && styles.chipSelected,
              ]}
              onPress={() => setMode(m)}
            >
              <Text
                style={[
                  styles.chipText,
                  mode === m && styles.chipTextSelected,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Save Goal"
          onPress={handleCreate}
          loading={submitting}
          disabled={!title.trim()}
          style={{ marginTop: 24 }}
        />
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
    padding: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
