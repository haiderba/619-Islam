import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/context/ThemeContext';
import { QuranQuote } from '@/constants/versesAndHadiths';

interface DailyVerseCardProps {
  quote: QuranQuote;
}

export const DailyVerseCard: React.FC<DailyVerseCardProps> = ({ quote }) => {
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPng = async () => {
    try {
      setExporting(true);
      if (!cardRef.current) return;

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (Platform.OS === 'web') {
        const a = document.createElement('a');
        a.href = uri;
        a.download = `619-Quran-Quote-${quote.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Daily Quran Quote',
            UTI: 'public.png',
          });
        } else {
          Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Failed to capture card PNG:', error);
      Alert.alert('Export Failed', 'Could not export card as PNG.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Capturable Card Container */}
      <View
        ref={cardRef}
        collapsable={false}
        style={[
          styles.cardContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Decorative Header */}
        <View style={styles.cardHeader}>
          <View style={styles.brandBadge}>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>619</Text>
            <Text style={[styles.brandSub, { color: colors.secondaryText }]}>DISCIPLINE DAILY</Text>
          </View>
          <Text style={[styles.headerTag, { color: colors.accentGold, backgroundColor: colors.goldGlow }]}>
            📖 DAILY QURAN QUOTE
          </Text>
        </View>

        {/* Arabic Text */}
        <View style={styles.arabicContainer}>
          <Text style={[styles.arabicText, { color: colors.accentGold }]}>{quote.arabic}</Text>
        </View>

        {/* Urdu Translation */}
        <View style={styles.translationContainer}>
          <Text style={[styles.urduText, { color: colors.text }]}>{quote.urdu}</Text>
        </View>

        {/* English Translation */}
        <View style={styles.translationContainer}>
          <Text style={[styles.englishText, { color: colors.secondaryText }]}>"{quote.english}"</Text>
        </View>

        {/* Footer Surah Reference */}
        <View style={styles.cardFooter}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.surahText, { color: colors.primary }]}>— {quote.surah}</Text>
        </View>
      </View>

      {/* Export Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleExportPng}
        disabled={exporting}
        style={[styles.exportBtn, { backgroundColor: colors.primary }]}
      >
        {exporting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.exportIcon}>📸</Text>
            <Text style={styles.exportText}>Export Card as PNG</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  cardContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1.5,
    marginRight: 6,
  },
  brandSub: {
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 1.5,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  arabicContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: Platform.OS === 'android' ? 50 : 44,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'sans-serif',
  },
  translationContainer: {
    marginVertical: 6,
  },
  urduText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '600',
  },
  englishText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  dividerLine: {
    height: 1,
    width: 60,
    marginBottom: 10,
  },
  surahText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  exportIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  exportText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
