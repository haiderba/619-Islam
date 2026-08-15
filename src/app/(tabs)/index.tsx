import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { QURAN_QUOTES } from '@/constants/versesAndHadiths';
import { DailyVerseCard } from '@/components/dashboard/DailyVerseCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Bell, BrainCircuit, Heart, MessageCircle, Book, Gift, Sun, Cloud, Moon, Menu, Search } from 'lucide-react-native';
import { MosqueHeader } from '@/components/dashboard/MosqueHeader';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { fetchPrayerTimes } from '@/services/quranApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GRID_ITEMS = [
  { id: 'habits', label: 'Habits', icon: Bell, route: '/habits' },
  { id: 'goals', label: 'Goals', icon: BrainCircuit, route: '/goals' },
  { id: 'progress', label: 'Progress', icon: Heart, route: '/progress' },
  { id: 'deen', label: 'Deen Hub', icon: MessageCircle, route: '/deen' },
  { id: 'settings', label: 'Settings', icon: Book, route: '/settings' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, settings } = useUserProfile();
  const { goals, completions, toggleTask, refreshGoals } = useGoals();
  const { streakData, refreshStreak } = useStreak();

  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationDisplay, setLocationDisplay] = useState('Sylhet, Bangladesh');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  // Prayer Times State
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [nextPrayerName, setNextPrayerName] = useState('Maghrib');
  const [nextPrayerTimeLeft, setNextPrayerTimeLeft] = useState('0:00:00');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // update every sec for accurate countdown
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshGoals();
      refreshStreak();
    }, [refreshGoals, refreshStreak])
  );

  const fetchLocationAndPrayers = async () => {
    try {
      setIsFetchingLocation(true);
      let lat: number | undefined = undefined;
      let lng: number | undefined = undefined;
      let addressStr: string | undefined = undefined;

      if (settings.locationMode === 'manual' && settings.manualLocation) {
        const { city, state, country, area } = settings.manualLocation;
        addressStr = [area, city, state, country].filter(Boolean).join(', ');
        setLocationDisplay(addressStr || 'Unknown Location');
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lng = location.coords.longitude;
          const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (geocode && geocode.length > 0) {
            const current = geocode[0];
            const city = current.city || current.region || current.subregion || 'Unknown';
            const country = current.country || 'Unknown';
            setLocationDisplay(`${city}, ${country}`);
          } else {
            // Default if geocoding fails but we have coords
            setLocationDisplay('GPS Location');
          }
        } else {
           // Fallback default
           lat = 24.8949; // Sylhet
           lng = 91.8687;
           setLocationDisplay('Sylhet, Bangladesh');
        }
      }

      // Fetch Prayer Times using Aladhan (accepts lat/lng OR address)
      const times = await fetchPrayerTimes(lat, lng, addressStr);
      if (times) {
        setPrayerTimes(times);
      }
    } catch (e) {
      console.log('Location error:', e);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocationAndPrayers();
  }, [settings.locationMode, JSON.stringify(settings.manualLocation)]);

  // Calculate Next Prayer Countdown
  useEffect(() => {
    if (!prayerTimes) return;
    const now = currentTime;
    const currentMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
    
    const prayers = [
      { name: 'Fajar', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha },
    ];

    let next = prayers[0];
    let minDiff = Infinity;
    
    for (const p of prayers) {
      if (!p.time) continue;
      const [ph, pm] = p.time.split(':').map(Number);
      const pMs = ph * 3600000 + pm * 60000;
      if (pMs > currentMs && (pMs - currentMs) < minDiff) {
        minDiff = pMs - currentMs;
        next = p;
      }
    }
    
    // If all passed, next is Fajar tomorrow
    if (minDiff === Infinity) {
      const [ph, pm] = prayers[0].time.split(':').map(Number);
      const pMs = ph * 3600000 + pm * 60000 + 86400000; // Add 24 hours
      minDiff = pMs - currentMs;
      next = prayers[0];
    }

    setNextPrayerName(next.name);
    
    const h = Math.floor(minDiff / 3600000);
    const m = Math.floor((minDiff % 3600000) / 60000);
    const s = Math.floor((minDiff % 60000) / 1000);
    setNextPrayerTimeLeft(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

  }, [currentTime, prayerTimes]);

  const quotesList = QURAN_QUOTES.slice(0, 5);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = SCREEN_WIDTH - 60 + 16;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeQuoteIndex && index >= 0 && index < quotesList.length) {
      setActiveQuoteIndex(index);
    }
  };

  const completedGoalIds = new Set(
    completions.filter((c) => c.completed).map((c) => c.goalId)
  );

  const totalTasks = goals.length;
  const completedTasks = goals.filter((g) => completedGoalIds.has(g.id)).length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom + 105, 120);

  let rawHours = currentTime.getHours();
  let ampm = 'AM';
  if (settings.timeFormat === '12hr') {
    ampm = rawHours >= 12 ? 'PM' : 'AM';
    rawHours = rawHours % 12 || 12;
  }
  const hoursStr = rawHours.toString().padStart(2, '0');
  const minutesStr = currentTime.getMinutes().toString().padStart(2, '0');

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const formattedDate = `${currentTime.getDate()} ${monthNames[currentTime.getMonth()]}, ${currentTime.getFullYear()}`;

  const formatPrayerTime = (time24: string) => {
    if (!time24) return '--:--';
    if (settings.timeFormat === '24hr') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampmStr = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampmStr}`;
  };

  const PRAYERS_LIST = [
    { name: 'Fajar', time: prayerTimes?.fajr, icon: Cloud },
    { name: 'Dhuhr', time: prayerTimes?.dhuhr, icon: Sun },
    { name: 'Asr', time: prayerTimes?.asr, icon: Cloud },
    { name: 'Maghrib', time: prayerTimes?.maghrib, icon: Moon },
    { name: 'Isha', time: prayerTimes?.isha, icon: Moon },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <DashboardHeader
          greeting="As-salamu alaykum"
          subGreeting={formattedDate}
        />

        <View style={styles.mainContent}>
          {/* NEXT PRAYER HIGHLIGHT */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={[styles.nextPrayerCard, { backgroundColor: colors.primary }]}
          >
            <View>
              <Text style={styles.nextPrayerLabel}>NEXT PRAYER</Text>
              <Text style={styles.nextPrayerNameText}>{nextPrayerName}</Text>
            </View>
            <View style={styles.nextPrayerTimeContainer}>
              <Text style={styles.nextPrayerTimeText}>{nextPrayerTimeLeft}</Text>
              <Text style={styles.nextPrayerSubText}>remaining</Text>
            </View>
          </Animated.View>

          {/* QUICK ACTIONS GRID */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.gridContainer}
          >
            {GRID_ITEMS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}>
                <View style={[styles.gridIconBg, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                  <item.icon color={colors.primary} size={22} />
                </View>
                <Text style={[styles.gridLabel, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Prayer Times</Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>{locationDisplay}</Text>
            </View>

            <View style={styles.sliderContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {PRAYERS_LIST.map((prayer, index) => (
                  <View key={index} style={[styles.prayerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginRight: 12 }]}>
                    <prayer.icon color={colors.primary} size={20} />
                    <Text style={[styles.prayerName, { color: colors.secondaryText }]}>{prayer.name}</Text>
                    <Text style={[styles.prayerTime, { color: colors.text }]}>{formatPrayerTime(prayer.time)}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 32 }]}>Daily Inspiration</Text>
            <View style={styles.sliderContainer}>
              <ScrollView
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH - 48 + 16}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 20 }}
                onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                  const offsetX = e.nativeEvent.contentOffset.x;
                  const activeIdx = Math.round(offsetX / (SCREEN_WIDTH - 48 + 16));
                  setActiveQuoteIndex(activeIdx);
                }}
                scrollEventThrottle={16}
              >
                {QURAN_QUOTES.map((quote, index) => (
                  <View key={index} style={[styles.sliderSlide, { marginRight: index === QURAN_QUOTES.length - 1 ? 0 : 16 }]}>
                    <DailyVerseCard quote={quote} />
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.paginationContainer}>
              {QURAN_QUOTES.slice(0, 5).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: activeQuoteIndex === index ? colors.primary : colors.border, width: activeQuoteIndex === index ? 16 : 8 }
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Progress</Text>
            <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <View style={styles.overviewRow}>
                <ProgressRing
                  percentage={percentage}
                  size={70}
                  strokeWidth={7}
                  progressColor={colors.primary}
                  backgroundColor={colors.border}
                />
                <View style={styles.overviewStats}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{completedTasks} / {totalTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Daily Habits Completed</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0 }]}>Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/goals' as any)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <Text style={{ color: colors.secondaryText, marginBottom: 12 }}>No habits created yet</Text>
              <Button title="Create a Habit" onPress={() => router.push('/goals' as any)} />
            </View>
          ) : (
            goals.map((goal) => (
              <TaskItem key={goal.id} goal={goal} completed={completedGoalIds.has(goal.id)} onToggle={() => toggleTask(goal.id)} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: {
    paddingHorizontal: 0,
  },
  nextPrayerCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  nextPrayerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nextPrayerNameText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  nextPrayerTimeContainer: {
    alignItems: 'flex-end',
  },
  nextPrayerTimeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  nextPrayerSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 32,
  },
  gridItem: {
    width: '20%',
    alignItems: 'center',
  },
  gridIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  prayerCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  prayerName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderSlide: {
    width: SCREEN_WIDTH - 48,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    height: 10,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  overviewCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 32,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStats: {
    marginLeft: 20,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 24,
  },
});
