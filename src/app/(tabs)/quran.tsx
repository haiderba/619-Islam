import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Search, BookOpen, Layers } from 'lucide-react-native';
import { fetchSurahs } from '@/services/quranApi';

export default function QuranScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  const [surahs, setSurahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchSurahs();
      setSurahs(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topNav}>
        <TouchableOpacity><Menu color={colors.text} size={24} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>QURAN</Text>
        <TouchableOpacity><Search color={colors.text} size={24} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Last Read Card */}
        <View style={styles.lastReadWrapper}>
          <LinearGradient colors={colors.gradientColors} style={styles.lastReadCard}>
            <Text style={[styles.lastReadLabel, { color: colors.text }]}>Last Read</Text>
            <Text style={[styles.lastReadSurah, { color: colors.text }]}>Al-Fatihah</Text>
            <Text style={[styles.lastReadAyah, { color: colors.text, opacity: 0.8 }]}>Ayah No: 1</Text>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Al Quran</Text>
          <View style={[styles.tabsRow, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[
                activeTab === 'surah' ? styles.activeTab : styles.inactiveTab,
                activeTab === 'surah' && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
              ]}
              onPress={() => setActiveTab('surah')}
            >
              <Text style={[activeTab === 'surah' ? styles.activeTabText : styles.inactiveTabText, { color: activeTab === 'surah' ? colors.primary : colors.secondaryText }]}>Surah</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                activeTab === 'juz' ? styles.activeTab : styles.inactiveTab,
                activeTab === 'juz' && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
              ]}
              onPress={() => setActiveTab('juz')}
            >
              <Text style={[activeTab === 'juz' ? styles.activeTabText : styles.inactiveTabText, { color: activeTab === 'juz' ? colors.primary : colors.secondaryText }]}>Juz</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Content */}
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : activeTab === 'surah' ? (
            surahs.map((surah) => (
              <TouchableOpacity 
                key={surah.number} 
                style={[styles.surahRow, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/quran/${surah.number}?type=surah` as any)}
              >
                <View style={[styles.surahNumberBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.surahNumberText, { color: colors.text }]}>{surah.number.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.surahInfo}>
                  <Text style={[styles.surahName, { color: colors.text }]}>{surah.name_english}</Text>
                  <View style={styles.surahSubRow}>
                    <BookOpen color={colors.secondaryText} size={12} style={{marginRight: 4}}/>
                    <Text style={[styles.surahAyahs, { color: colors.secondaryText }]}>{surah.verses_count} Ayahs</Text>
                  </View>
                </View>
                <Text style={[styles.surahArabic, { color: colors.accentGold }]}>{surah.name_arabic}</Text>
              </TouchableOpacity>
            ))
          ) : (
            JUZ_LIST.map((juzNum) => (
              <TouchableOpacity 
                key={juzNum} 
                style={[styles.surahRow, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/quran/${juzNum}?type=juz` as any)}
              >
                <View style={[styles.surahNumberBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.surahNumberText, { color: colors.text }]}>{juzNum.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.surahInfo}>
                  <Text style={[styles.surahName, { color: colors.text }]}>Juz {juzNum}</Text>
                  <View style={styles.surahSubRow}>
                    <Layers color={colors.secondaryText} size={12} style={{marginRight: 4}}/>
                    <Text style={[styles.surahAyahs, { color: colors.secondaryText }]}>Part {juzNum}</Text>
                  </View>
                </View>
                <Text style={[styles.surahArabic, { color: colors.accentGold }]}>الجزء {juzNum}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  lastReadWrapper: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8, marginBottom: 32 },
  lastReadCard: { borderRadius: 20, padding: 24, minHeight: 140 },
  lastReadLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  lastReadSurah: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  lastReadAyah: { fontSize: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  tabsRow: { flexDirection: 'row', borderRadius: 20, padding: 4 },
  activeTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  activeTabText: { fontSize: 12, fontWeight: '700' },
  inactiveTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  inactiveTabText: { fontSize: 12, fontWeight: '600' },
  listContainer: { gap: 16 },
  surahRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  surahNumberBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  surahNumberText: { fontSize: 13, fontWeight: '800' },
  surahInfo: { flex: 1 },
  surahName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  surahSubRow: { flexDirection: 'row', alignItems: 'center' },
  surahAyahs: { fontSize: 12, fontWeight: '600' },
  surahArabic: { fontSize: 22, fontWeight: '400' }
});
