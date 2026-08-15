import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Search } from 'lucide-react-native';

export default function QiblaScreen() {
  const { colors } = useTheme();
  const [angle, setAngle] = useState(257);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topNav}>
        <TouchableOpacity><Menu color="#1F2937" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>QIBLA FINDER</Text>
        <TouchableOpacity><Search color="#1F2937" size={24} /></TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.compassWrapper}>
          <View style={styles.compassOuter}>
             <View style={styles.compassInner}>
                <Text style={styles.compassLabelN}>N</Text>
                <Text style={styles.compassLabelE}>E</Text>
                <Text style={styles.compassLabelS}>S</Text>
                <Text style={styles.compassLabelW}>W</Text>
                
                <View style={[styles.needle, { transform: [{ rotate: `${angle}deg` }] }]}>
                  <View style={styles.needleTop} />
                  <View style={styles.needleCenter} />
                  <View style={styles.needleBottom} />
                </View>
             </View>
          </View>
        </View>

        <Text style={styles.angleText}>{angle}°</Text>
        <Text style={styles.subtitleText}>Device's angle to qibla</Text>

        <View style={styles.instructionBadge}>
          <Text style={styles.instructionText}>Rotate the phone 135° to the left</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', letterSpacing: 1 },
  content: { flex: 1, alignItems: 'center', paddingTop: 60 },
  compassWrapper: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center', marginBottom: 60 },
  compassOuter: { width: 280, height: 280, borderRadius: 140, backgroundColor: '#FDF0E6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FDE0CB' },
  compassInner: { width: 240, height: 240, borderRadius: 120, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  compassLabelN: { position: 'absolute', top: 10, fontSize: 16, fontWeight: '800', color: '#1F2937' },
  compassLabelE: { position: 'absolute', right: 10, fontSize: 16, fontWeight: '800', color: '#1F2937' },
  compassLabelS: { position: 'absolute', bottom: 10, fontSize: 16, fontWeight: '800', color: '#1F2937' },
  compassLabelW: { position: 'absolute', left: 10, fontSize: 16, fontWeight: '800', color: '#1F2937' },
  needle: { position: 'absolute', width: 20, height: 160, alignItems: 'center', justifyContent: 'center' },
  needleTop: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 80, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#EA580C' },
  needleBottom: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 80, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FDE0CB' },
  needleCenter: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1F2937', position: 'absolute', top: 74, zIndex: 10 },
  angleText: { fontSize: 32, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  subtitleText: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 40 },
  instructionBadge: { backgroundColor: '#FDF0E6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  instructionText: { fontSize: 13, fontWeight: '700', color: '#6B4226' }
});
