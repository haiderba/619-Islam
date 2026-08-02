import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

interface ProgressRingProps {
  percentage: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  hidePercentage?: boolean;
  centerContent?: React.ReactNode;
  progressColor?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  label,
  subLabel,
  hidePercentage = false,
  centerContent,
  progressColor,
}) => {
  const { colors } = useTheme();
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (circumference * validPercentage) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor || colors.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <View style={styles.textContainer}>
        {centerContent ? (
          centerContent
        ) : (
          <>
            {!hidePercentage && (
              <Text style={[styles.percentageText, { color: colors.text }]}>
                {Math.round(validPercentage)}%
              </Text>
            )}
            {subLabel && <Text style={[styles.subText, { color: colors.secondaryText }]}>{subLabel}</Text>}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '800',
  },
  subText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
});
