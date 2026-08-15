import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
// import { supabase } from '@/config/supabase';
const supabase = {
  from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: null, error: null }) }) }) }),
  rpc: () => Promise.resolve({ data: null, error: null })
};
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react-native';

type QuranModalProps = {
  visible: boolean;
  habit: any;
  onClose: () => void;
  onComplete: () => void;
};

const SURAHS = [
  'Al-Fatihah', 'Al-Baqarah', 'Aal-E-Imran', 'Yaseen', 'Ar-Rahman', 'Al-Waqi\'ah', 'Al-Mulk', 'Al-Kahf'
];

const SPEEDS = [
  { id: 'fast', label: 'Fast', days: 3 },
  { id: 'normal', label: 'Normal', days: 5 },
  { id: 'easy', label: 'Easy', days: 10 },
];

export default function QuranHabitModal({ visible, habit, onClose, onComplete }: QuranModalProps) {
  const { colors } = useTheme();
  const { session } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [participantConfig, setParticipantConfig] = useState<any>(null);
  
  // Setup State
  const [selectedSurah, setSelectedSurah] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState<any>(null);

  useEffect(() => {
    if (visible && habit && session?.user) {
      loadConfig();
    }
  }, [visible, habit]);

  const loadConfig = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('habit_participants')
      .select('participant_metadata')
      .eq('habit_id', habit.id)
      .eq('user_id', session!.user.id)
      .single();
      
    if (data && data.participant_metadata && data.participant_metadata.surah) {
      setParticipantConfig(data.participant_metadata);
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    if (!selectedSurah || !selectedSpeed || !session?.user) return;
    
    const config = {
      surah: selectedSurah,
      speed: selectedSpeed.id,
      total_days: selectedSpeed.days,
      start_date: new Date().toISOString().split('T')[0]
    };
    
    await supabase.from('habit_participants').update({
      participant_metadata: config
    }).eq('habit_id', habit.id).eq('user_id', session.user.id);
    
    setParticipantConfig(config);
  };

  const logDailyProgress = async () => {
    if (!session?.user || !habit) return;
    const today = new Date().toISOString().split('T')[0];
    
    await supabase.from('habit_completions').upsert({
      habit_id: habit.id,
      user_id: session.user.id,
      completion_date: today,
      progress: 1,
      is_completed: true
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

          {loading ? (
            <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
          ) : !participantConfig ? (
            // Configuration Step
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Select a Surah to read</Text>
              <View style={styles.surahList}>
                {SURAHS.map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[
                      styles.surahChip, 
                      { borderColor: colors.border },
                      selectedSurah === s && { borderColor: colors.primary, backgroundColor: colors.primary + '20' }
                    ]}
                    onPress={() => setSelectedSurah(s)}
                  >
                    <Text style={{ color: selectedSurah === s ? colors.primary : colors.text, fontWeight: '600' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedSurah ? (
                <>
                  <Text style={[styles.subtitle, { color: colors.secondaryText, marginTop: 24 }]}>Select reading pace</Text>
                  <View style={styles.speedList}>
                    {SPEEDS.map(speed => (
                      <TouchableOpacity 
                        key={speed.id} 
                        style={[
                          styles.speedCard, 
                          { borderColor: colors.border, backgroundColor: colors.card },
                          selectedSpeed?.id === speed.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                        ]}
                        onPress={() => setSelectedSpeed(speed)}
                      >
                        <Text style={[styles.speedLabel, { color: colors.text }]}>{speed.label}</Text>
                        <Text style={{ color: colors.secondaryText }}>Split into {speed.days} days</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}

              <TouchableOpacity 
                style={[
                  styles.saveBtn, 
                  { backgroundColor: (selectedSurah && selectedSpeed) ? colors.primary : colors.border }
                ]}
                disabled={!selectedSurah || !selectedSpeed}
                onPress={saveConfig}
              >
                <Text style={styles.saveText}>Start Plan</Text>
                <ChevronRight color="#FFF" size={20} />
              </TouchableOpacity>
            </ScrollView>
          ) : (
            // Daily Progress Step
            <View style={styles.dailyView}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <BookOpen color={colors.primary} size={48} />
              </View>
              <Text style={[styles.readingTitle, { color: colors.text }]}>Surah {participantConfig.surah}</Text>
              <Text style={{ color: colors.secondaryText, fontSize: 16, textAlign: 'center', marginBottom: 32 }}>
                Pace: {participantConfig.total_days} Days ({participantConfig.speed})
              </Text>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={logDailyProgress}
              >
                <CheckCircle2 color="#FFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.saveText}>Mark Today's Portion Complete</Text>
              </TouchableOpacity>
            </View>
          )}

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
    minHeight: '70%',
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 16, marginBottom: 12, fontWeight: '600' },
  closeBtn: { padding: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  surahList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  surahChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  speedList: { gap: 12 },
  speedCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  speedLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
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
    marginRight: 8
  },
  dailyView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  readingTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  }
});
