import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StorageService } from '@/services/storageService';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppLanguage, UserGoalFocus } from '@/types/user';

const FOCUS_OPTIONS: UserGoalFocus[] = [
  'My Deen',
  'My Health',
  'My Knowledge',
  'My Career',
  'My Habits',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [language, setLanguage] = useState<AppLanguage>('English');
  const [selectedFocus, setSelectedFocus] = useState<UserGoalFocus[]>(['My Deen']);

  const toggleFocus = (focus: UserGoalFocus) => {
    if (selectedFocus.includes(focus)) {
      if (selectedFocus.length > 1) {
        setSelectedFocus(selectedFocus.filter((f) => f !== focus));
      }
    } else {
      setSelectedFocus([...selectedFocus, focus]);
    }
  };

  const handleFinish = async () => {
    if (!name.trim()) return;

    await StorageService.saveUserProfile({
      name: name.trim(),
      language,
      focusAreas: selectedFocus,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    });

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={[styles.brandTitle, { color: colors.primary }]}>619</Text>
          <Text style={[styles.brandSubtitle, { color: colors.secondaryText }]}>DISCIPLINE DAILY</Text>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>What should we call you?</Text>
            <Text style={[styles.stepDescription, { color: colors.secondaryText }]}>
              Enter your name to personalize your daily experience.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Your Name (e.g. Usman)"
              placeholderTextColor={colors.secondaryText}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Text style={[styles.stepTitle, { marginTop: 28, color: colors.text }]}>Preferred Language</Text>
            <View style={styles.languageRow}>
              {(['English', 'Urdu'] as AppLanguage[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.8}
                  style={[
                    styles.langChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    language === lang && { backgroundColor: colors.goldGlow, borderColor: colors.primary },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.langText,
                      { color: colors.secondaryText },
                      language === lang && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Continue"
              onPress={() => setStep(2)}
              disabled={!name.trim()}
              style={{ marginTop: 36 }}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>What do you want to improve?</Text>
            <Text style={[styles.stepDescription, { color: colors.secondaryText }]}>
              Select the key areas of your life you want to build discipline in.
            </Text>

            <View style={styles.focusList}>
              {FOCUS_OPTIONS.map((item) => {
                const isSelected = selectedFocus.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    onPress={() => toggleFocus(item)}
                  >
                    <Card
                      style={[
                        styles.focusCard,
                        isSelected && { borderColor: colors.primary, backgroundColor: colors.goldGlow },
                      ]}
                    >
                      <Text
                        style={[
                          styles.focusText,
                          { color: colors.text },
                          isSelected && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && <Text style={[styles.checkIcon, { color: colors.primary }]}>✓</Text>}
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Back"
                variant="secondary"
                onPress={() => setStep(1)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Get Started"
                onPress={handleFinish}
                style={{ flex: 2, marginLeft: 8 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '600',
    marginTop: 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  languageRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  langText: {
    fontWeight: '600',
  },
  focusList: {
    marginVertical: 12,
  },
  focusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 16,
  },
  focusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkIcon: {
    fontWeight: '800',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 28,
  },
});
