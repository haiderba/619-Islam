import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
// import { supabase } from '@/config/supabase';
const supabase = {
  from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: null, error: null }) }) }) }),
  rpc: () => Promise.resolve({ data: null, error: null })
};
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle2 } from 'lucide-react-native';
import { Audio } from 'expo-audio';
import * as Haptics from 'expo-haptics';

type TasbeehModalProps = {
  visible: boolean;
  habit: any;
  onClose: () => void;
  onComplete: () => void;
};

export default function TasbeehHabitModal({ visible, habit, onClose, onComplete }: TasbeehModalProps) {
  const { colors } = useTheme();
  const { session } = useAuth();
  const [count, setCount] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const target = habit?.target_value || 100;

  useEffect(() => {
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/click.mp3') // Ensure this sound exists or gracefully fail
        );
        setSound(sound);
      } catch (e) {
        console.log("No sound file found, skipping audio");
      }
    }
    loadSound();
    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const handleTap = async () => {
    if (count >= target) return;

    if (sound) {
      await sound.replayAsync();
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCount(prev => prev + 1);
  };

  const saveProgress = async () => {
    if (!session?.user || !habit) return;
    const today = new Date().toISOString().split('T')[0];
    
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
            Target: {target}
          </Text>

          <View style={styles.counterContainer}>
            <Pressable 
              style={[
                styles.tapArea, 
                { backgroundColor: count >= target ? colors.primary : colors.card, borderColor: colors.border }
              ]} 
              onPress={handleTap}
            >
              <Text style={[styles.countText, { color: count >= target ? '#FFF' : colors.text }]}>
                {count}
              </Text>
              <Text style={[styles.tapText, { color: count >= target ? '#FFF' : colors.secondaryText }]}>
                {count >= target ? 'Completed!' : 'Tap anywhere to count'}
              </Text>
            </Pressable>
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
  subtitle: { fontSize: 16, marginBottom: 32 },
  closeBtn: { padding: 8 },
  counterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  countText: {
    fontSize: 72,
    fontWeight: '900',
  },
  tapText: {
    fontSize: 16,
    marginTop: 8,
  },
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
