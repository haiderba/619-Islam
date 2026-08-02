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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
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
  const [tasbeehs, setTasbeehs] = useState<TasbeehItem[]>(DEFAULT_PRESETS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Custom Tasbeeh form fields
  const [newTitle, setNewTitle] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newTarget, setNewTarget] = useState('33');

  useEffect(() => {
    async function loadCustom() {
      const custom = await StorageService.getCustomTasbeehs();
      setTasbeehs([...DEFAULT_PRESETS, ...custom]);
    }
    loadCustom();
  }, []);

  const active = tasbeehs[selectedIndex] || DEFAULT_PRESETS[0];

  const handleTap = () => {
    const nextCount = active.currentCount + 1;
    const updated = [...tasbeehs];
    updated[selectedIndex] = {
      ...active,
      currentCount: nextCount,
    };
    setTasbeehs(updated);

    if (nextCount === active.targetCount) {
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
    <Card variant="glass" style={styles.card}>
      {/* Header & Custom Creator Trigger */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>📿 Digital Tasbeeh</Text>
        <Button
          title="+ Custom Tasbeeh"
          size="small"
          variant="cyan"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Preset Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {tasbeehs.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={[
              styles.presetChip,
              selectedIndex === idx && styles.presetChipSelected,
            ]}
            onPress={() => setSelectedIndex(idx)}
          >
            <Text
              style={[
                styles.presetChipText,
                selectedIndex === idx && styles.presetChipTextSelected,
              ]}
            >
              {item.title} {item.isCustom ? '⭐' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active Dhikr Display */}
      <View style={styles.dhikrDisplay}>
        {active.arabic ? <Text style={styles.arabicText}>{active.arabic}</Text> : null}
        <Text style={styles.titleText}>{active.title}</Text>
        {active.translation ? <Text style={styles.translationText}>{active.translation}</Text> : null}
      </View>

      {/* Interactive Tap Button with Clean Center Content */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleTap}
        style={styles.tapArea}
      >
        <ProgressRing
          percentage={percentage}
          size={170}
          strokeWidth={14}
          progressColor={Colors.primary}
          centerContent={
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{active.currentCount}</Text>
              <Text style={styles.targetLabel}>TARGET: {active.targetCount}</Text>
              <Text style={styles.tapHint}>TAP TO COUNT</Text>
            </View>
          }
        />
      </TouchableOpacity>

      {/* Reset Action */}
      <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
        <Text style={styles.resetText}>🔄 Reset Counter</Text>
      </TouchableOpacity>

      {/* Custom Tasbeeh Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Custom Tasbeeh</Text>

            <Text style={styles.fieldLabel}>Tasbeeh Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Salawat on Prophet"
              placeholderTextColor={Colors.secondaryText}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.fieldLabel}>Arabic Text (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ"
              placeholderTextColor={Colors.secondaryText}
              value={newArabic}
              onChangeText={setNewArabic}
            />

            <Text style={styles.fieldLabel}>Translation (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. O Allah send peace upon Muhammad"
              placeholderTextColor={Colors.secondaryText}
              value={newTranslation}
              onChangeText={setNewTranslation}
            />

            <Text style={styles.fieldLabel}>Target Count (e.g. 33, 100, 1000)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="33"
              keyboardType="number-pad"
              placeholderTextColor={Colors.secondaryText}
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
                variant="cyan"
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
    marginVertical: 12,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: Colors.primary,
  },
  presetChipText: {
    color: Colors.secondaryText,
    fontWeight: '600',
    fontSize: 13,
  },
  presetChipTextSelected: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  dhikrDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  arabicText: {
    color: Colors.accentGold,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  translationText: {
    color: Colors.secondaryText,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tapArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  countContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: Colors.primaryLight,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },
  targetLabel: {
    color: Colors.accentCyan,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tapHint: {
    color: Colors.mutedText,
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
    color: Colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  fieldLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
