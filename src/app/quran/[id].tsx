import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, Play, Pause, FastForward, Rewind } from 'lucide-react-native';
import { fetchSurahDetails, fetchJuzDetails } from '@/services/quranApi';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export default function QuranReaderScreen() {
  const { id, type } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentAyahPlaying, setCurrentAyahPlaying] = useState<number | null>(null);

  // Initialize expo-audio player with no source initially
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  
  // Track if we are playing the full surah or an individual ayah
  const [playingType, setPlayingType] = useState<'surah' | 'ayah' | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (type === 'surah') {
        const res = await fetchSurahDetails(Number(id));
        setData(res);
      } else if (type === 'juz') {
        const res = await fetchJuzDetails(Number(id));
        setData(res);
      }
      setLoading(false);
    }
    loadData();
  }, [id, type]);

  // When playback finishes, reset states
  useEffect(() => {
    if (status.currentTime > 0 && Math.abs(status.duration - status.currentTime) < 0.5) {
      if (playingType === 'ayah') {
        setCurrentAyahPlaying(null);
        setPlayingType(null);
      } else if (playingType === 'surah') {
        setPlayingType(null);
      }
    }
  }, [status.currentTime, status.duration, playingType]);

  const togglePlayback = () => {
    if (!data) return;

    if (playingType === 'surah') {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } else {
      let audioUrl = null;
      if (type === 'surah' && data?.audio && data.audio.length > 0) {
        audioUrl = data.audio[0].surah_audio;
      }
      if (audioUrl) {
        setPlayingType('surah');
        setCurrentAyahPlaying(null);
        player.replace(audioUrl);
        player.play();
      } else {
        alert("Audio recitation not available for this selection.");
      }
    }
  };

  const playAyahAudio = (url: string, index: number) => {
    setPlayingType('ayah');
    setCurrentAyahPlaying(index);
    player.replace(url);
    player.play();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const title = type === 'surah' ? data?.surah?.name_english : `Juz ${data?.juz_number}`;
  const verses = type === 'surah' ? data?.verses : data?.verses;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Reader Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {type === 'surah' && data?.surah?.number !== 1 && data?.surah?.number !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={[styles.bismillahText, { color: colors.text }]}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</Text>
          </View>
        )}

        {verses?.map((verse: any, index: number) => (
          <View key={verse.verse_key} style={[styles.verseContainer, { borderBottomColor: colors.border }]}>
            <View style={styles.verseHeader}>
              <View style={[styles.verseNumberBadge, { backgroundColor: colors.surfaceHighlight }]}>
                <Text style={[styles.verseNumberText, { color: colors.primary }]}>{verse.ayah}</Text>
              </View>
              <View style={styles.verseActions}>
                {verse.audio?.ayah_audio && (
                  <TouchableOpacity 
                    onPress={() => playAyahAudio(verse.audio.ayah_audio, index)}
                    style={styles.ayahPlayButton}
                  >
                    {currentAyahPlaying === index && status.playing ? (
                       <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                       <Play color={colors.primary} size={18} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={[styles.arabicText, { color: colors.accentGold }]}>{verse.arabic}</Text>
            <Text style={[styles.translationText, { color: colors.text }]}>{verse.translations.sahih_international}</Text>
            {verse.translations.urdu && (
              <Text style={[styles.urduText, { color: colors.secondaryText }]}>{verse.translations.urdu}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Audio Player for Full Surah */}
      {type === 'surah' && (
        <View style={[styles.audioPlayer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.audioControlButton} onPress={() => player.seekBy(-10)}>
            <Rewind color={colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={togglePlayback}
          >
            {status.playing && playingType === 'surah' ? (
              <Pause color="#FFFFFF" size={32} />
            ) : (
              <Play color="#FFFFFF" size={32} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.audioControlButton} onPress={() => player.seekBy(10)}>
            <FastForward color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  bismillahContainer: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  bismillahText: { fontSize: 26 },
  verseContainer: { marginBottom: 32, paddingBottom: 24, borderBottomWidth: 1 },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  verseNumberBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  verseNumberText: { fontSize: 14, fontWeight: '700' },
  verseActions: { flexDirection: 'row' },
  ayahPlayButton: { padding: 8 },
  arabicText: { fontSize: 28, lineHeight: 50, textAlign: 'right', marginBottom: 20 },
  translationText: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
  urduText: { fontSize: 16, lineHeight: 28, textAlign: 'right', fontWeight: '500' },
  audioPlayer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderTopWidth: 1, gap: 32 },
  audioControlButton: { padding: 12 },
  playButton: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
});
