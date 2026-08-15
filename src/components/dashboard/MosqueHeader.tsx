import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { getIslamicDateString, getDesiDateString, getIslamicEvent } from '@/utils/dateUtils';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

interface MosqueHeaderProps {
  hours: string;
  minutes: string;
  locationDisplay: string;
  formattedDate: string;
  nextPrayerName: string;
  nextPrayerTimeLeft: string;
  timeFormat: '12hr' | '24hr';
  ampm?: string;
}

export function MosqueHeader({
  hours,
  minutes,
  locationDisplay,
  formattedDate,
  nextPrayerName,
  nextPrayerTimeLeft,
  timeFormat,
  ampm,
}: MosqueHeaderProps) {
  const { colors } = useTheme();
  
  const islamicDate = getIslamicDateString();
  const desiDate = getDesiDateString();
  const islamicEvent = getIslamicEvent();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradientColors}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Mosque Silhouette SVG Background */}
      <View style={styles.svgContainer}>
        <Svg width={width} height={200} viewBox="0 0 400 200">
          <Defs>
            <SvgGradient id="mosqueGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
            </SvgGradient>
          </Defs>
          <Path
            d="M0,200 L400,200 L400,120 Q380,120 370,100 Q360,80 360,40 L350,40 L350,80 Q350,100 340,120 Q330,120 310,120 L290,120 Q280,100 275,80 Q270,50 250,50 Q230,50 225,80 Q220,100 210,120 L190,120 Q180,100 175,80 Q170,30 150,30 Q130,30 125,80 Q120,100 110,120 L90,120 Q80,100 75,80 Q70,50 50,50 Q30,50 25,80 Q20,100 10,120 L0,120 Z"
            fill="url(#mosqueGrad)"
          />
          <Path
            d="M150,10 A8,8 0 1,1 150,26 A8,8 0 1,0 150,10 Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
          <Path
            d="M50,35 A5,5 0 1,1 50,45 A5,5 0 1,0 50,35 Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
          <Path
            d="M250,35 A5,5 0 1,1 250,45 A5,5 0 1,0 250,35 Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
        </Svg>
      </View>

      {/* Foreground Content */}
      <View style={styles.content}>
        
        {/* Extra Dates (Desi/Islamic) */}
        <View style={styles.extraDatesContainer}>
          <Text style={[styles.extraDateText, { color: colors.text }]}>{islamicDate}</Text>
          <Text style={[styles.extraDateDot, { color: colors.primary }]}> • </Text>
          <Text style={[styles.extraDateText, { color: colors.text }]}>{desiDate}</Text>
        </View>
        {islamicEvent && (
          <View style={[styles.eventBadge, { backgroundColor: colors.goldGlow }]}>
            <Text style={[styles.eventText, { color: colors.accentGold }]}>{islamicEvent}</Text>
          </View>
        )}

        {/* Giant Clock */}
        <View style={styles.clockRow}>
          <Text style={[styles.clockDigit, { color: colors.text }]}>{hours}</Text>
          <View style={styles.clockColonContainer}>
            <View style={[styles.clockDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.clockDot, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.clockDigit, { color: colors.text }]}>{minutes}</Text>
          {timeFormat === '12hr' && (
            <Text style={[styles.ampm, { color: colors.primary }]}>{ampm}</Text>
          )}
        </View>

        {/* Info Footer Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlockLeft}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>REMAINING TIME</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{nextPrayerName} {nextPrayerTimeLeft}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoBlockRight}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{formattedDate}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>{locationDisplay}</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 360,
    width: '100%',
    position: 'relative',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraDatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  extraDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  extraDateDot: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  eventBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  eventText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  clockDigit: {
    fontSize: 90,
    fontWeight: '900',
    letterSpacing: -2,
  },
  clockColonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginHorizontal: 12,
    gap: 12,
  },
  clockDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ampm: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 8,
    marginTop: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  infoBlockLeft: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  infoBlockRight: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  divider: {
    width: 1,
    height: 36,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'left',
  },
});
