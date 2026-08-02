import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'cyan' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {};
    if (variant === 'primary') base = { backgroundColor: Colors.primary };
    if (variant === 'cyan') base = { backgroundColor: Colors.accentCyan };
    if (variant === 'secondary') base = { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border };
    if (variant === 'outline') base = { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary };
    if (variant === 'danger') base = { backgroundColor: Colors.danger };

    if (size === 'small') base = { ...base, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 };
    if (size === 'medium') base = { ...base, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 };
    if (size === 'large') base = { ...base, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 };

    if (disabled) base.opacity = 0.5;

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { fontWeight: '700', fontSize: 15, textAlign: 'center' };
    if (variant === 'primary') base.color = '#FFFFFF';
    if (variant === 'cyan') base.color = '#0D1117';
    if (variant === 'secondary') base.color = Colors.text;
    if (variant === 'outline') base.color = Colors.primaryLight;
    if (variant === 'danger') base.color = '#FFFFFF';

    if (size === 'small') base.fontSize = 13;
    if (size === 'large') base.fontSize = 17;

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'cyan' ? '#0D1117' : '#FFFFFF'} />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : {}, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
