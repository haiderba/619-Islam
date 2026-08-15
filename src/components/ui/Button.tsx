import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {};
    if (variant === 'primary') base = { backgroundColor: colors.primary };
    if (variant === 'cyan') base = { backgroundColor: colors.accentCyan };
    if (variant === 'secondary') base = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };
    if (variant === 'outline') base = { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
    if (variant === 'danger') base = { backgroundColor: colors.danger };

    if (size === 'small') base = { ...base, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 24 };
    if (size === 'medium') base = { ...base, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30 };
    if (size === 'large') base = { ...base, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 36 };

    if (disabled) base.opacity = 0.5;

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { fontWeight: '700', fontSize: 15, textAlign: 'center' };
    if (variant === 'primary') base.color = '#FFFFFF';
    if (variant === 'cyan') base.color = '#FFFFFF';
    if (variant === 'secondary') base.color = colors.text;
    if (variant === 'outline') base.color = colors.primary;
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
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
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
