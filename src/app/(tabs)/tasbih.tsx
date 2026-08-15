import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, RotateCcw, Check } from 'lucide-react-native';

import { useTheme } from '@/context/ThemeContext';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { TasbeehItem } from '@/types/tasbeeh';
import { StorageService } from '@/services/storageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_PRESETS: TasbeehItem[] = [
  { id: 'subhanallah', title: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', translation: 'Glory be to Allah', targetCount: 33, currentCount: 0 },
  { id: 'alhamdulillah', title: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', translation: 'Praise be to Allah', targetCount: 33, currentCount: 0 },
  { id: 'allahuakbar', title: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', translation: 'Allah is the Greatest', targetCount: 34, currentCount: 0 },
  { id: 'astaghfirullah', title: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', translation: 'I seek forgiveness from Allah', targetCount: 100, currentCount: 0 },
];

export default function TasbihScreen() {
  const { colors } = useTheme();
  const gradientColors = colors.gradientColors;
  const insets = useSafeAreaInsets();
  
  const [tasbeehs, setTasbeehs] = useState<TasbeehItem[]>(DEFAULT_PRESETS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const active = tasbeehs[selectedIndex] || DEFAULT_PRESETS[0];
  
  const [newTitle, setNewTitle] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newTarget, setNewTarget] = useState('33');

  // Load custom tasbeehs
  useEffect(() => {
    const loadCustom = async () => {
      const customItems = await StorageService.getCustomTasbeehs();
      setTasbeehs([...DEFAULT_PRESETS, ...customItems]);
    };
    loadCustom();
  }, []);

  const player = useAudioPlayer(require('../../../assets/sounds/click.wav'));

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      player.replay();
    } catch (e) { }

    const updated = [...tasbeehs];
    let nextCount = active.currentCount + 1;
    
    if (nextCount === active.targetCount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (nextCount > active.targetCount) {
      nextCount = 1; 
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    updated[selectedIndex] = { ...active, currentCount: nextCount };
    setTasbeehs(updated);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    const updated = [...tasbeehs];
    updated[selectedIndex] = { ...active, currentCount: 0 };
    setTasbeehs(updated);
  };

  const handleCreateCustom = async () => {
    if (!newTitle.trim()) return;
    const targetNum = parseInt(newTarget, 10) || 33;
    const newCustomItem: TasbeehItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      arabic: newArabic.trim(),
      translation: newTranslation.trim(),
      targetCount: targetNum,
      currentCount: 0,
      isCustom: true,
    };
    const updatedCustom = await StorageService.addCustomTasbeeh(newCustomItem);
    setTasbeehs([...DEFAULT_PRESETS, ...updatedCustom]);
    setSelectedIndex(DEFAULT_PRESETS.length + updatedCustom.length - 1);
    setModalVisible(false);
    setNewTitle(''); setNewArabic(''); setNewTranslation(''); setNewTarget('33');
  };

  const percentage = (active.currentCount / active.targetCount) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 40) }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tasbeeh</Text>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: colors.primary }]} 
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#FFFFFF" size={16} />
          <Text style={styles.addBtnText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.presetsScroll}
        >
          {tasbeehs.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[
                  styles.presetChip,
                  { backgroundColor: isSelected ? colors.greenGlow : colors.surface, borderColor: isSelected ? colors.primary : colors.border }
                ]}
                onPress={() => setSelectedIndex(idx)}
              >
                <Text style={[
                  styles.presetText, 
                  { color: isSelected ? colors.primaryDark : colors.secondaryText },
                  isSelected && styles.presetTextActive
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.dhikrInfo}>
          {active.arabic ? <Text style={[styles.arabicText, { color: colors.accentGold }]}>{active.arabic}</Text> : null}
          <Text style={[styles.translationText, { color: colors.secondaryText }]}>{active.translation || active.title}</Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handleTap} 
          style={styles.tapArea}
        >
          <ProgressRing
            percentage={percentage}
            size={SCREEN_WIDTH * 0.8}
            strokeWidth={20}
            hidePercentage={true}
            progressColor={colors.primary}
            backgroundColor={colors.border}
            centerContent={
              <View style={styles.ringCenter}>
                <Text style={[styles.countText, { color: colors.text }]}>{active.currentCount}</Text>
                <Text style={[styles.targetText, { color: colors.primary }]}>TARGET: {active.targetCount}</Text>
              </View>
            }
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          activeOpacity={0.7} 
          onPress={handleReset}
        >
          <RotateCcw color={colors.secondaryText} size={18} />
          <Text style={[styles.resetBtnText, { color: colors.secondaryText }]}>Reset Counter</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Tasbeeh Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Tasbeeh</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Name (e.g. Salawat)"
              placeholderTextColor={colors.mutedText}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Arabic (Optional)"
              placeholderTextColor={colors.mutedText}
              value={newArabic}
              onChangeText={setNewArabic}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Translation (Optional)"
              placeholderTextColor={colors.mutedText}
              value={newTranslation}
              onChangeText={setNewTranslation}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Target Count (e.g. 33)"
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedText}
              value={newTarget}
              onChangeText={setNewTarget}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.surface }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }, !newTitle.trim() && { opacity: 0.5 }]} 
                onPress={handleCreateCustom}
                disabled={!newTitle.trim()}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: 'row',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  presetsWrapper: {
    height: 60,
  },
  presetsScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  presetChipInactive: {},
  presetChipActive: {},
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  presetTextActive: {
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  dhikrInfo: {
    alignItems: 'center',
    paddingHorizontal: 30,
    minHeight: 100,
  },
  arabicText: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  translationText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tapArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 80,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  }
});
