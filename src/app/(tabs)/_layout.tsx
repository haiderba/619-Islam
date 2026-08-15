import React, { useRef, useEffect } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Platform, View, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, BookOpen, Circle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TAB_BAR_MARGIN = 20;
const TAB_BAR_WIDTH = width - (TAB_BAR_MARGIN * 2);

function CustomTabBar({ state, descriptors, navigation, insets, colors, isDark }: any) {
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 16);
  
  // Explicitly list the tabs we want to show on the bottom bar
  const VISIBLE_TABS = ['index', 'quran', 'tasbih'];
  
  // Filter out hidden tabs
  const visibleRoutes = state.routes.filter((route: any) => {
    return VISIBLE_TABS.includes(route.name);
  });

  const TAB_WIDTH = TAB_BAR_WIDTH / visibleRoutes.length;
  
  // Animation value for the sliding pill
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Find the index in visible routes
  const activeVisibleIndex = visibleRoutes.findIndex((r: any) => r.key === state.routes[state.index].key);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeVisibleIndex * TAB_WIDTH,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [activeVisibleIndex, TAB_WIDTH]);

  return (
    <View style={[styles.tabBarContainer, { 
      bottom: bottomInset,
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      borderColor: colors.border,
      shadowColor: colors.primary,
    }]}>
      {/* Sliding Pill Indicator */}
      <Animated.View 
        style={[
          styles.slidingPill, 
          { 
            width: TAB_WIDTH,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <View style={[styles.pillInner, { backgroundColor: colors.greenGlow, borderColor: colors.primary }]} />
      </Animated.View>

      {visibleRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.routes[state.index].key === route.key;

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const Icon = options.tabBarIcon;
        const title = options.title;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
          >
            {Icon && Icon({ color: isFocused ? colors.primary : colors.mutedText, size: 24, focused: isFocused })}
            <Text style={[
              styles.tabLabel, 
              { color: isFocused ? colors.primary : colors.mutedText }
            ]}>
              {title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();
  const isDark = colors.isDark;
  const insets = useSafeAreaInsets();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} insets={insets} colors={colors} isDark={isDark} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color, focused }) => <BookOpen color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      <Tabs.Screen
        name="tasbih"
        options={{
          title: 'Tasbih',
          tabBarIcon: ({ color, focused }) => <Circle color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      
      {/* Hide legacy/other tabs from the bottom bar */}
      <Tabs.Screen name="qibla" options={{ href: null }} />
      <Tabs.Screen name="deen" options={{ href: null }} />
      <Tabs.Screen name="habits" options={{ href: null }} />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: TAB_BAR_MARGIN,
    right: TAB_BAR_MARGIN,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  slidingPill: {
    position: 'absolute',
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  tabItem: {
    flex: 1,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  }
});
