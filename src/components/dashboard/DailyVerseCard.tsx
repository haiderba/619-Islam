import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Download } from 'lucide-react-native';
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
          <Image 
            source={require('@/assets/images/619_logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>

        {/* Arabic Text */}
        <View style={[styles.arabicContainer, { flex: 1, justifyContent: 'center' }]}>
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

      {/* Export Action Button (Absolutely positioned so it is not captured in the PNG) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleExportPng}
        disabled={exporting}
        style={[styles.exportBtn, { backgroundColor: '#FDF0E6' }]} // matching the new surface Highlight
      >
        {exporting ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Download color={colors.primary} size={18} />
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
    height: 420,
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  arabicContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 22,
    lineHeight: Platform.OS === 'android' ? 44 : 38,
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
    fontSize: 13,
    lineHeight: 20,
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
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  }
});
