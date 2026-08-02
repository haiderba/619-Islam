import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';

interface Ayah {
  number: number;
  text: string;
  translation: string;
  urdu: string;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishMeaning: string;
  versesCount: number;
  audioUrl: string;
  ayahs: Ayah[];
}

const SURAH_LIST: SurahData[] = [
  {
    number: 1,
    name: 'سُورَةُ الْفَاتِحَةِ',
    englishName: 'Al-Fatiha',
    englishMeaning: 'The Opening',
    versesCount: 7,
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3',
    ayahs: [
      {
        number: 1,
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        urdu: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔',
      },
      {
        number: 2,
        text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: '[All] praise is [due] to Allah, Lord of the worlds -',
        urdu: 'سب تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔',
      },
      {
        number: 3,
        text: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'The Entirely Merciful, the Especially Merciful,',
        urdu: 'بڑا مہربان، نہایت رحم کرنے والا۔',
      },
      {
        number: 4,
        text: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Sovereign of the Day of Recompense.',
        urdu: 'روزِ جزا کا مالک۔',
      },
      {
        number: 5,
        text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'It is You we worship and You we ask for help.',
        urdu: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔',
      },
      {
        number: 6,
        text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide us to the straight path -',
        urdu: 'ہمیں سیدھے راستے کی ہدایت فرما۔',
      },
      {
        number: 7,
        text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.',
        urdu: 'ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ کہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔',
      },
    ],
  },
  {
    number: 36,
    name: 'سُورَةُ يس',
    englishName: 'Ya-Sin',
    englishMeaning: 'Ya Sin',
    versesCount: 83,
    audioUrl: 'https://server8.mp3quran.net/afs/036.mp3',
    ayahs: [
      {
        number: 1,
        text: 'يس ۝١ وَالْقُرْآنِ الْحَكِيمِ ۝٢ إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
        translation: 'Ya, Seen. By the wise Qur\'an. Indeed you, [O Muhammad], are from among the messengers.',
        urdu: 'یس۔ حکمت والے قرآن کی قسم۔ بے شک آپ رسولوں میں سے ہیں۔',
      },
    ],
  },
  {
    number: 67,
    name: 'سُورَةُ الْمُلْكِ',
    englishName: 'Al-Mulk',
    englishMeaning: 'The Sovereignty',
    versesCount: 30,
    audioUrl: 'https://server8.mp3quran.net/afs/067.mp3',
    ayahs: [
      {
        number: 1,
        text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        translation: 'Blessed is He in whose hand is dominion, and He is over all things competent -',
        urdu: 'بڑی برکت والا ہے وہ جس کے ہاتھ میں بادشاہی ہے اور وہ ہر چیز پر قادر ہے۔',
      },
    ],
  },
  {
    number: 112,
    name: 'سُورَةُ الإِخْلَاصِ',
    englishName: 'Al-Ikhlas',
    englishMeaning: 'Sincerity',
    versesCount: 4,
    audioUrl: 'https://server8.mp3quran.net/afs/112.mp3',
    ayahs: [
      {
        number: 1,
        text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        translation: 'Say, "He is Allah, [who is] One,',
        urdu: 'کہہ دیجیے کہ وہ اللہ ایک ہے۔',
      },
      {
        number: 2,
        text: 'اللَّهُ الصَّمَدُ',
        translation: 'Allah, the Eternal Refuge.',
        urdu: 'اللہ بے نیاز ہے۔',
      },
      {
        number: 3,
        text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        translation: 'He neither begets nor is born,',
        urdu: 'نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے۔',
      },
      {
        number: 4,
        text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        translation: 'Nor is there to Him any equivalent."',
        urdu: 'اور نہ کوئی اس کا ہمسر ہے۔',
      },
    ],
  },
];

export function QuranReader() {
  const { colors } = useTheme();
  const [selectedSurah, setSelectedSurah] = useState<SurahData>(SURAH_LIST[0]);
  const [sound, setSound] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        try {
          sound.unloadAsync();
        } catch {}
      }
    };
  }, [sound]);

  const togglePlayAudio = async () => {
    if (isPlaying && sound) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
      } catch {}
      return;
    }

    if (sound) {
      try {
        await sound.playAsync();
        setIsPlaying(true);
      } catch {}
      return;
    }

    setLoadingAudio(true);
    try {
      // Dynamic import to prevent ExponentAV crash on Expo Go development clients
      const { Audio } = await import('expo-av');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: selectedSurah.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e: any) {
      Alert.alert(
        'Audio Recitation Note 🎧',
        `Reciting ${selectedSurah.englishName} online.\nRe-run "npx expo start --clear" to reload native audio binary.`
      );
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleSelectSurah = async (s: SurahData) => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {}
      setSound(null);
      setIsPlaying(false);
    }
    setSelectedSurah(s);
  };

  return (
    <View style={styles.container}>
      {/* Surah Selection Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {SURAH_LIST.map((s) => {
          const isSelected = selectedSurah.number === s.number;
          return (
            <TouchableOpacity
              key={s.number}
              activeOpacity={0.8}
              onPress={() => handleSelectSurah(s)}
              style={[
                styles.surahChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { backgroundColor: colors.greenGlow, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.surahChipText,
                  { color: colors.secondaryText },
                  isSelected && { color: colors.primaryLight, fontWeight: '800' },
                ]}
              >
                {s.englishName} ({s.name})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Surah Header Card & Audio Reciter */}
      <Card variant="goldGlow" style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.surahArabicTitle, { color: colors.text }]}>{selectedSurah.name}</Text>
            <Text style={[styles.surahEnglishTitle, { color: colors.primary }]}>
              {selectedSurah.englishName} • {selectedSurah.englishMeaning} ({selectedSurah.versesCount} Ayahs)
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={togglePlayAudio}
            style={[styles.audioBtn, { backgroundColor: colors.primary }]}
          >
            {loadingAudio ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.audioBtnText}>{isPlaying ? '⏸️ Pause' : '▶️ Listen'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </Card>

      {/* Ayahs Stream */}
      {selectedSurah.ayahs.map((ayah) => (
        <Card key={ayah.number} style={styles.ayahCard}>
          <View style={styles.ayahBadgeRow}>
            <View style={[styles.ayahBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.ayahNumber, { color: colors.primary }]}>Ayah {ayah.number}</Text>
            </View>
          </View>

          <Text style={[styles.arabicText, { color: colors.text }]}>{ayah.text}</Text>

          <View style={styles.translationBox}>
            <Text style={[styles.translationEnglish, { color: colors.secondaryText }]}>
              {ayah.translation}
            </Text>
            <Text style={[styles.translationUrdu, { color: colors.accentGold }]}>
              {ayah.urdu}
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  chipScroll: {
    marginBottom: 12,
  },
  surahChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  surahChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surahArabicTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  surahEnglishTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  audioBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  ayahCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
  },
  ayahBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  ayahBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  ayahNumber: {
    fontSize: 11,
    fontWeight: '800',
  },
  arabicText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
    lineHeight: 38,
    marginBottom: 12,
  },
  translationBox: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  translationEnglish: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  translationUrdu: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    lineHeight: 22,
  },
});
