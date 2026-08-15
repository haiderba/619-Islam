import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
// import { supabase } from '@/config/supabase';
const supabase = {
  from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: null, error: null }) }) }) }),
  rpc: () => Promise.resolve({ data: null, error: null })
};
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle2, Circle } from 'lucide-react-native';

type NamazModalProps = {
  visible: boolean;
  habit: any;
  onClose: () => void;
  onComplete: () => void;
};

const PRAYERS = [
  { id: 'fajr', label: 'Fajr' },
  { id: 'dhuhr', label: 'Dhuhr' },
  { id: 'asr', label: 'Asr' },
  { id: 'maghrib', label: 'Maghrib' },
  { id: 'isha', label: 'Isha' },
];

export default function NamazHabitModal({ visible, habit, onClose, onComplete }: NamazModalProps) {
  const { colors } = useTheme();
  const { session } = useAuth();
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  
  const togglePrayer = (id: string) => {
    setCompletedPrayers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const saveProgress = async () => {
    if (!session?.user || !habit) return;
    const today = new Date().toISOString().split('T')[0];
    const target = habit.target_value || 5;
    const count = completedPrayers.length;
    
    await supabase.from('habit_completions').upsert({
      habit_id: habit.id,
      user_id: session.user.id,
      completion_date: today,
      progress: count,
      is_completed: count >= target
    }, { onConflict: 'habit_id,user_id,completion_date' });
    
    onComplete();
    onClose();
  };

  if (!habit) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{habit.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Mark your completed prayers for today.
          </Text>

          <View style={styles.list}>
            {PRAYERS.map(prayer => {
              const isChecked = completedPrayers.includes(prayer.id);
              return (
                <TouchableOpacity 
                  key={prayer.id}
                  style={[styles.prayerRow, { borderColor: colors.border }]}
                  onPress={() => togglePrayer(prayer.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.prayerText, { color: colors.text }]}>{prayer.label}</Text>
                  {isChecked ? (
                    <CheckCircle2 color={colors.primary} size={28} />
                  ) : (
                    <Circle color={colors.secondaryText} size={28} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={saveProgress}
          >
            <CheckCircle2 color="#FFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.saveText}>Save Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 16, marginBottom: 24 },
  closeBtn: { padding: 8 },
  list: { flex: 1 },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  prayerText: { fontSize: 18, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  saveText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  }
});
