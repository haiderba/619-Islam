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
import { Colors } from '@/constants/colors';
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>619</Text>
          <Text style={styles.brandSubtitle}>DISCIPLINE DAILY</Text>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What should we call you?</Text>
            <Text style={styles.stepDescription}>
              Enter your name to personalize your daily experience.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Your Name (e.g. Usman)"
              placeholderTextColor={Colors.secondaryText}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Text style={[styles.stepTitle, { marginTop: 28 }]}>Preferred Language</Text>
            <View style={styles.languageRow}>
              {(['English', 'Urdu'] as AppLanguage[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.8}
                  style={[
                    styles.langChip,
                    language === lang && styles.langChipSelected,
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.langText,
                      language === lang && styles.langTextSelected,
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
            <Text style={styles.stepTitle}>What do you want to improve?</Text>
            <Text style={styles.stepDescription}>
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
                        isSelected && styles.focusCardSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.focusText,
                          isSelected && styles.focusTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && <Text style={styles.checkIcon}>✓</Text>}
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
    backgroundColor: Colors.background,
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
    color: Colors.primary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.secondaryText,
    letterSpacing: 3,
    fontWeight: '600',
    marginTop: 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    color: Colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langChipSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.primary,
  },
  langText: {
    color: Colors.secondaryText,
    fontWeight: '600',
  },
  langTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
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
  focusCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  focusText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  focusTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  checkIcon: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 28,
  },
});
