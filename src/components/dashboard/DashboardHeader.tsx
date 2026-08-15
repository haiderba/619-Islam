import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Search } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardHeaderProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  greeting?: string;
  subGreeting?: string;
}

export function DashboardHeader({
  onMenuPress,
  onSearchPress,
  greeting = "As-salamu alaykum",
  subGreeting = "Welcome back to your journey",
}: DashboardHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.headerContainer,
      {
        paddingTop: insets.top + 10,
        backgroundColor: colors.background,
      }
    ]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onMenuPress}
        >
          <Menu color={colors.text} size={20} />
        </TouchableOpacity>

        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.subGreetingText, { color: colors.secondaryText }]}>{subGreeting}</Text>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onSearchPress}
        >
          <Search color={colors.text} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    alignItems: 'center',
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subGreetingText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
