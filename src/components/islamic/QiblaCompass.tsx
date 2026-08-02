import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { calculateQiblaDirection } from '@/utils/qiblaUtils';

export const QiblaCompass: React.FC = () => {
  const [userLat] = useState(31.5204); // Default location
  const [userLng] = useState(74.3587);

  const qiblaAngle = Math.round(calculateQiblaDirection(userLat, userLng));

  return (
    <Card variant="glass" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🧭 Qibla Compass</Text>
        <Text style={styles.subTitle}>Bearing to Mecca: {qiblaAngle}°</Text>
      </View>

      <View style={styles.compassContainer}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          {/* Outer Dial */}
          <Circle cx={100} cy={100} r={90} stroke={Colors.cardBorder} strokeWidth={4} fill="none" />
          <Circle cx={100} cy={100} r={80} stroke={Colors.surface} strokeWidth={2} fill="none" />

          {/* Cardinal Directions */}
          <SvgText x={100} y={30} fill={Colors.accentCyan} fontSize="14" fontWeight="bold" textAnchor="middle">N</SvgText>
          <SvgText x={175} y={105} fill={Colors.secondaryText} fontSize="14" fontWeight="bold" textAnchor="middle">E</SvgText>
          <SvgText x={100} y={180} fill={Colors.secondaryText} fontSize="14" fontWeight="bold" textAnchor="middle">S</SvgText>
          <SvgText x={25} y={105} fill={Colors.secondaryText} fontSize="14" fontWeight="bold" textAnchor="middle">W</SvgText>

          {/* Kaaba Direction Indicator Line */}
          <G transform={`rotate(${qiblaAngle} 100 100)`}>
            <Line x1={100} y1={100} x2={100} y2={35} stroke={Colors.accentGold} strokeWidth={4} strokeLinecap="round" />
            <Circle cx={100} cy={30} r={8} fill={Colors.accentGold} />
          </G>

          {/* Center Point */}
          <Circle cx={100} cy={100} r={6} fill={Colors.primary} />
        </Svg>
      </View>

      <View style={styles.footer}>
        <Text style={styles.kaabaLabel}>🕋 Align device until Gold indicator points to Top</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subTitle: {
    color: Colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  compassContainer: {
    marginVertical: 12,
  },
  footer: {
    marginTop: 12,
  },
  kaabaLabel: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
