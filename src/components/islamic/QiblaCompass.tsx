import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { calculateQiblaDirection } from '@/utils/qiblaUtils';

export const QiblaCompass: React.FC = () => {
  const { colors } = useTheme();
  
  // Real sensor states
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Get GPS Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to find Qibla.');
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLat(location.coords.latitude);
        setUserLng(location.coords.longitude);
        
        // Calculate Qibla based on real GPS
        const qAngle = Math.round(calculateQiblaDirection(location.coords.latitude, location.coords.longitude));
        setQiblaAngle(qAngle);
      } catch (err) {
        setErrorMsg('Could not fetch location.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Subscribe to Magnetometer (Compass)
  useEffect(() => {
    let subscription: any;
    
    Magnetometer.setUpdateInterval(100); // Update 10 times a second for smoothness
    
    subscription = Magnetometer.addListener(result => {
      // Calculate true heading from x,y sensor data
      let angle = Math.atan2(result.y, result.x);
      
      // Convert to degrees and adjust for layout
      angle = angle * (180 / Math.PI);
      
      // Standard compass correction (0 is North)
      angle = angle - 90;
      if (angle < 0) {
        angle = 360 + angle;
      }
      
      setHeading(Math.round(angle));
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <Card style={[styles.card, { paddingVertical: 40 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subTitle, { color: colors.secondaryText, marginTop: 12 }]}>Finding Mecca...</Text>
      </Card>
    );
  }

  if (errorMsg || qiblaAngle === null) {
    return (
      <Card style={[styles.card, { paddingVertical: 40 }]}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</Text>
      </Card>
    );
  }

  // Calculate rotation. 
  // If the phone points North (heading 0), the compass dial doesn't rotate.
  // If the phone points East (heading 90), we rotate the dial left (-90) so North points to the left.
  const dialRotation = 360 - heading;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🧭 Qibla Directions</Text>
        <Text style={[styles.bearingDisplay, { color: colors.accentGold }]}>{qiblaAngle}° W</Text>
        <Text style={[styles.subTitle, { color: colors.secondaryText }]}>Bearing from current location to Mecca</Text>
      </View>

      {/* iOS Compass Dial View */}
      <View style={styles.compassWrapper}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          
          {/* Entire Dial Rotates based on Magnetic Heading */}
          <G transform={`rotate(${dialRotation} 110 110)`}>
            
            {/* Outer Glass Bezel Ring */}
            <Circle cx={110} cy={110} r={102} stroke={colors.cardBorder} strokeWidth={2} fill="none" />
            <Circle cx={110} cy={110} r={96} stroke={colors.border} strokeWidth={1.5} fill="none" />

            {/* Dial Degrees Ticks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30;
              return (
                <G key={i} transform={`rotate(${angle} 110 110)`}>
                  <Line x1={110} y1={14} x2={110} y2={22} stroke={colors.secondaryText} strokeWidth={2} />
                </G>
              );
            })}

            {/* Cardinal Directions */}
            <SvgText x={110} y={34} fill={colors.primary} fontSize="14" fontWeight="bold" textAnchor="middle">N</SvgText>
            <SvgText x={192} y={115} fill={colors.secondaryText} fontSize="14" fontWeight="bold" textAnchor="middle">E</SvgText>
            <SvgText x={110} y={196} fill={colors.secondaryText} fontSize="14" fontWeight="bold" textAnchor="middle">S</SvgText>
            <SvgText x={28} y={115} fill={colors.secondaryText} fontSize="14" fontWeight="bold" textAnchor="middle">W</SvgText>

            {/* Qibla Direction Arrow */}
            <G transform={`rotate(${qiblaAngle} 110 110)`}>
              {/* North Needle Point */}
              <Line x1={110} y1={110} x2={110} y2={42} stroke={colors.accentGold} strokeWidth={4} strokeLinecap="round" />
              <Path d="M 110 32 L 104 46 L 116 46 Z" fill={colors.accentGold} />
              <Circle cx={110} cy={30} r={10} fill={colors.accentGold} />
              <SvgText x={110} y={34} fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">🕋</SvgText>
            </G>
            
          </G>

          {/* Center Pivot Pin (Fixed) */}
          <Circle cx={110} cy={110} r={8} fill={colors.primary} />
          <Circle cx={110} cy={110} r={4} fill="#FFFFFF" />
          
          {/* Top Notch to show phone's physical top (Fixed) */}
          <Path d="M 105 5 L 115 5 L 110 15 Z" fill={colors.primary} />
        </Svg>
      </View>

      <View style={[styles.alignmentBadge, { backgroundColor: colors.goldGlow, borderColor: colors.goldGlowBorder }]}>
        <Text style={[styles.alignmentText, { color: colors.accentGold }]}>
          🕋 Hold device flat — Align Gold needle with Top
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bearingDisplay: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  compassWrapper: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignmentBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  alignmentText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
