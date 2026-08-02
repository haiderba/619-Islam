import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '@/constants/colors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'surface' | 'highlight' | 'goldGlow' | 'cyanGlow' | 'glass';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ variant = 'default', style, children, ...props }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface':
        return Colors.surface;
      case 'highlight':
        return Colors.surfaceHighlight;
      case 'goldGlow':
        return 'rgba(212, 175, 55, 0.12)';
      case 'cyanGlow':
        return Colors.glassGlowCyan;
      case 'glass':
        return Colors.glassGlowViolet;
      default:
        return Colors.card;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'goldGlow':
        return 'rgba(212, 175, 55, 0.35)';
      case 'cyanGlow':
        return 'rgba(6, 182, 212, 0.35)';
      case 'glass':
        return 'rgba(124, 58, 237, 0.4)';
      default:
        return Colors.cardBorder;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});
