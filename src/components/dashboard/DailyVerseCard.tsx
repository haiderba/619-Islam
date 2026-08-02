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
import { Colors } from '@/constants/colors';
import { QuranQuote } from '@/constants/versesAndHadiths';

interface DailyVerseCardProps {
  quote: QuranQuote;
}

export const DailyVerseCard: React.FC<DailyVerseCardProps> = ({ quote }) => {
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
        style={styles.cardContainer}
      >
        {/* Decorative Header */}
        <View style={styles.cardHeader}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandTitle}>619</Text>
            <Text style={styles.brandSub}>DISCIPLINE DAILY</Text>
          </View>
          <Text style={styles.headerTag}>📖 DAILY QURAN QUOTE</Text>
        </View>

        {/* Arabic Text */}
        <View style={styles.arabicContainer}>
          <Text style={styles.arabicText}>{quote.arabic}</Text>
        </View>

        {/* Urdu Translation */}
        <View style={styles.translationContainer}>
          <Text style={styles.urduText}>{quote.urdu}</Text>
        </View>

        {/* English Translation */}
        <View style={styles.translationContainer}>
          <Text style={styles.englishText}>"{quote.english}"</Text>
        </View>

        {/* Footer Surah Reference */}
        <View style={styles.cardFooter}>
          <View style={styles.dividerLine} />
          <Text style={styles.surahText}>— {quote.surah}</Text>
        </View>
      </View>

      {/* Export Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleExportPng}
        disabled={exporting}
        style={styles.exportBtn}
      >
        {exporting ? (
          <ActivityIndicator color="#000000" size="small" />
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
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.goldGlowBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
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
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1.5,
    marginRight: 6,
  },
  brandSub: {
    color: Colors.secondaryText,
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 1.5,
  },
  headerTag: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  arabicContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  arabicText: {
    color: Colors.primaryLight,
    fontSize: 24,
    lineHeight: 44,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'sans-serif',
  },
  translationContainer: {
    marginVertical: 6,
  },
  urduText: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '600',
  },
  englishText: {
    color: Colors.secondaryText,
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
    backgroundColor: Colors.goldGlowBorder,
    marginBottom: 10,
  },
  surahText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  exportIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  exportText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
});
