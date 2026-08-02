import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'surface' | 'highlight' | 'goldGlow';
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
        return Colors.goldGlow;
      default:
        return Colors.card;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getBackgroundColor() },
        variant === 'goldGlow' && styles.goldBorder,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goldBorder: {
    borderColor: Colors.goldGlowBorder,
  },
});
