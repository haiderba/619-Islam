import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { TasbeehItem } from '@/types/tasbeeh';
import { StorageService } from '@/services/storageService';

const DEFAULT_PRESETS: TasbeehItem[] = [
  {
    id: 'subhanallah',
    title: 'SubhanAllah',
    arabic: 'سُبْحَانَ اللَّهِ',
    translation: 'Glory be to Allah',
    targetCount: 33,
    currentCount: 0,
  },
  {
    id: 'alhamdulillah',
    title: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    translation: 'Praise be to Allah',
    targetCount: 33,
    currentCount: 0,
  },
  {
    id: 'allahuakbar',
    title: 'Allahu Akbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    targetCount: 34,
    currentCount: 0,
  },
  {
    id: 'astaghfirullah',
    title: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    translation: 'I seek forgiveness from Allah',
    targetCount: 100,
    currentCount: 0,
  },
];

export const TasbeehCounter: React.FC = () => {
  const { colors } = useTheme();
  const [tasbeehs, setTasbeehs] = useState<TasbeehItem[]>(DEFAULT_PRESETS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Custom Tasbeeh form fields
  const [newTitle, setNewTitle] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newTarget, setNewTarget] = useState('33');

  // Load sound using expo-audio's new hook
  const player = useAudioPlayer(require('../../../assets/sounds/click.wav'));

  useEffect(() => {
    async function loadCustom() {
      const custom = await StorageService.getCustomTasbeehs();
      setTasbeehs([...DEFAULT_PRESETS, ...custom]);
    }
    loadCustom();
  }, []);

  const active = tasbeehs[selectedIndex] || DEFAULT_PRESETS[0];

  const handleTap = () => {
    // Play sound and haptic
    if (player) {
      player.seekTo(0);
      player.play();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const nextCount = active.currentCount + 1;
    const updated = [...tasbeehs];
    updated[selectedIndex] = {
      ...active,
      currentCount: nextCount,
    };
    setTasbeehs(updated);

    if (nextCount === active.targetCount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Tasbeeh Complete! 🎉', `You have completed ${active.targetCount}x ${active.title}. May Allah accept it.`);
    }
  };

  const handleReset = () => {
    const updated = [...tasbeehs];
    updated[selectedIndex] = {
      ...active,
      currentCount: 0,
    };
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

    // Clear form
    setNewTitle('');
    setNewArabic('');
    setNewTranslation('');
    setNewTarget('33');
  };

  const percentage = (active.currentCount / active.targetCount) * 100;

  return (
    <Card style={styles.card}>
      {/* Header & Custom Creator Trigger */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>📿 Digital Tasbeeh</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.customBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.customBtnText, { color: colors.primary }]}>+ Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Preset Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {tasbeehs.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={[
                styles.presetChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { backgroundColor: colors.greenGlow, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedIndex(idx)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  { color: colors.secondaryText },
                  isSelected && { color: colors.primaryLight, fontWeight: '800' },
                ]}
              >
                {item.title} {item.isCustom ? '⭐' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Dhikr Phrase Display */}
      <View style={styles.dhikrDisplay}>
        {active.arabic ? <Text style={[styles.arabicText, { color: colors.accentGold }]}>{active.arabic}</Text> : null}
        <Text style={[styles.titleText, { color: colors.text }]}>{active.title}</Text>
        {active.translation ? <Text style={[styles.translationText, { color: colors.secondaryText }]}>{active.translation}</Text> : null}
      </View>

      {/* Large Interactive iOS Counter Ring */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleTap}
        style={styles.tapArea}
      >
        <ProgressRing
          percentage={percentage}
          size={180}
          strokeWidth={16}
          hidePercentage={true}
          progressColor={colors.primary}
          centerContent={
            <View style={styles.countBox}>
              <Text style={[styles.countNumber, { color: colors.text }]}>{active.currentCount}</Text>
              <Text style={[styles.targetText, { color: colors.primary }]}>TARGET: {active.targetCount}</Text>
              <Text style={[styles.tapText, { color: colors.mutedText }]}>TAP TO COUNT</Text>
            </View>
          }
        />
      </TouchableOpacity>

      {/* Reset Action */}
      <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
        <Text style={[styles.resetText, { color: colors.secondaryText }]}>🔄 Reset Counter</Text>
      </TouchableOpacity>

      {/* Custom Tasbeeh Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Tasbeeh</Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Tasbeeh Name *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Salawat on Prophet"
              placeholderTextColor={colors.mutedText}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Arabic Text (Optional)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ"
              placeholderTextColor={colors.mutedText}
              value={newArabic}
              onChangeText={setNewArabic}
            />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Translation (Optional)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. O Allah send peace upon Muhammad"
              placeholderTextColor={colors.mutedText}
              value={newTranslation}
              onChangeText={setNewTranslation}
            />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Target Count (e.g. 33, 100, 1000)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="33"
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedText}
              value={newTarget}
              onChangeText={setNewTarget}
            />

            <View style={styles.modalButtonRow}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Tasbeeh"
                variant="primary"
                onPress={handleCreateCustom}
                disabled={!newTitle.trim()}
                style={{ flex: 2, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    padding: 20,
    borderRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  customBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  presetChipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  dhikrDisplay: {
    alignItems: 'center',
    marginVertical: 8,
  },
  arabicText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
  },
  translationText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tapArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  countBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNumber: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 56,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tapText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
