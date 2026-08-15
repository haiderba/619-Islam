import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Calendar, Moon, Sun, Info } from 'lucide-react-native';

export function DateInfoCard() {
  const { colors } = useTheme();

  const { gregorian, hijri, desi, tip } = useMemo(() => {
    const now = new Date();
    
    // 1. Gregorian Date
    const gregorian = now.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // 2. Hijri Date (Using Intl API, falls back if unsupported)
    let hijri = '';
    let hijriDay = 0;
    let hijriMonthNumeric = 0;
    try {
      hijri = new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      
      const hijriParts = new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
      }).formatToParts(now);
      const dayPart = hijriParts.find(p => p.type === 'day');
      const monthPart = hijriParts.find(p => p.type === 'month');
      
      if (dayPart) hijriDay = parseInt(dayPart.value, 10);
      if (monthPart) hijriMonthNumeric = parseInt(monthPart.value, 10);
    } catch (e) {
      hijri = 'Islamic Date';
    }

    // 3. Desi Date (Simplified Nanakshahi / Bikrami mapping)
    const getDesiDate = (date: Date) => {
      const d = date.getDate();
      const m = date.getMonth() + 1;
      let month = "";
      let day = 0;

      if (m === 3) { if (d >= 14) { month = "Chet"; day = d - 13; } else { month = "Phagun"; day = d + 16; } }
      else if (m === 4) { if (d >= 14) { month = "Vaisakh"; day = d - 13; } else { month = "Chet"; day = d + 18; } }
      else if (m === 5) { if (d >= 15) { month = "Jeth"; day = d - 14; } else { month = "Vaisakh"; day = d + 17; } }
      else if (m === 6) { if (d >= 15) { month = "Harh"; day = d - 14; } else { month = "Jeth"; day = d + 17; } }
      else if (m === 7) { if (d >= 16) { month = "Sawan"; day = d - 15; } else { month = "Harh"; day = d + 16; } }
      else if (m === 8) { if (d >= 16) { month = "Bhadon"; day = d - 15; } else { month = "Sawan"; day = d + 16; } }
      else if (m === 9) { if (d >= 15) { month = "Assu"; day = d - 14; } else { month = "Bhadon"; day = d + 16; } }
      else if (m === 10) { if (d >= 15) { month = "Katak"; day = d - 14; } else { month = "Assu"; day = d + 15; } }
      else if (m === 11) { if (d >= 14) { month = "Maghar"; day = d - 13; } else { month = "Katak"; day = d + 17; } }
      else if (m === 12) { if (d >= 14) { month = "Poh"; day = d - 13; } else { month = "Maghar"; day = d + 16; } }
      else if (m === 1) { if (d >= 13) { month = "Magh"; day = d - 12; } else { month = "Poh"; day = d + 18; } }
      else if (m === 2) { if (d >= 12) { month = "Phagun"; day = d - 11; } else { month = "Magh"; day = d + 19; } }

      return `${day} ${month}`;
    };
    
    const desi = getDesiDate(now);

    // 4. Daily Tip & Hijri Historical Events
    const ISLAMIC_EVENTS: Record<string, string> = {
      '1-1': 'Islamic New Year (1st Muharram). A time for reflection.',
      '1-10': 'Day of Ashura. Fasting is highly recommended today.',
      '2-28': '28th Safar: Demise of Prophet Muhammad (PBUH) & Martyrdom of Imam Hasan (AS).',
      '3-12': '12th Rabi al-Awwal: Birth of Prophet Muhammad (PBUH).',
      '7-27': '27th Rajab: Isra and Mi\'raj (The Night Journey).',
      '8-15': 'Mid-Sha\'ban (Laylat al-Bara\'at). A night of forgiveness.',
      '9-1': 'First day of Ramadan! May Allah accept your fasts.',
      '9-17': '17th Ramadan: The historic Battle of Badr took place today.',
      '9-20': '20th Ramadan: The Conquest of Mecca.',
      '9-21': '21st Ramadan: Martyrdom of Ali ibn Abi Talib (AS).',
      '9-27': '27th Ramadan: Laylat al-Qadr is often observed tonight.',
      '10-1': 'Eid al-Fitr! A day of joy and celebration.',
      '12-8': '8th Dhu al-Hijjah: Day of Tarwiyah. Hajj begins!',
      '12-9': 'Day of Arafah. Fasting today expiates sins of two years.',
      '12-10': 'Eid al-Adha! The Festival of Sacrifice.',
      '12-18': '18th Dhu al-Hijjah: Event of Ghadir Khumm.'
    };

    let tip = "Start your day with Bismillah and gratitude.";
    const eventKey = `${hijriMonthNumeric}-${hijriDay}`;
    
    if (ISLAMIC_EVENTS[eventKey]) {
      // Prioritize historic events if one exists for today
      tip = ISLAMIC_EVENTS[eventKey];
    } else {
      // Otherwise fallback to weekly sunnahs
      const dayOfWeek = now.getDay(); // 0 = Sun, 5 = Fri
      if (dayOfWeek === 5) {
        tip = "Jummah Mubarak! Sunnah to read Surah Al-Kahf & send abundant Durood.";
      } else if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
        tip = "Ayyam al-Bid: Highly recommended to fast on these middle days of the lunar month.";
      } else if (dayOfWeek === 1 || dayOfWeek === 4) {
        tip = "Sunnah: Recommended to fast on Mondays & Thursdays.";
      }
    }

    return { gregorian, hijri, desi, tip };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.dateBlock}>
          <View style={styles.dateHeader}>
            <Calendar size={12} color={colors.primary} />
            <Text style={[styles.label, { color: colors.secondaryText }]}>TODAY</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.text }]}>{gregorian}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.dateBlock}>
          <View style={styles.dateHeader}>
            <Moon size={12} color={colors.primary} />
            <Text style={[styles.label, { color: colors.secondaryText }]}>HIJRI</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.text }]}>{hijri}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.dateBlock}>
          <View style={styles.dateHeader}>
            <Sun size={12} color={colors.primary} />
            <Text style={[styles.label, { color: colors.secondaryText }]}>DESI</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.text }]}>{desi}</Text>
        </View>
      </View>

      <View style={[styles.tipContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Info size={14} color={colors.accentGold} style={{ marginRight: 6 }} />
        <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    marginTop: -4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
