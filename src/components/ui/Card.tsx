import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface CardProps extends ViewProps {
  variant?: 'default' | 'surface' | 'highlight' | 'goldGlow' | 'cyanGlow' | 'glass';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ variant = 'default', style, children, ...props }) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface':
        return colors.surface;
      case 'highlight':
        return colors.surfaceHighlight;
      case 'goldGlow':
        return colors.goldGlow;
      case 'cyanGlow':
        return 'rgba(6, 182, 212, 0.15)';
      case 'glass':
        return colors.greenGlow;
      default:
        return colors.card;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'goldGlow':
        return colors.goldGlowBorder;
      case 'cyanGlow':
        return 'rgba(6, 182, 212, 0.35)';
      case 'glass':
        return colors.primary;
      default:
        return colors.cardBorder;
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
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
});
