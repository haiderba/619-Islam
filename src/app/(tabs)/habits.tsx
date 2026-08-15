import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/config/api';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

// Temporary mock to prevent runtime crashes for unimplemented backend endpoints
const supabase = {
  from: (table: string) => ({
    select: (query: string) => ({
      eq: (key: string, val: any) => ({
        eq: (key2: string, val2: any) => ({
          eq: (k3: string, v3: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ error: null }),
    upsert: () => Promise.resolve({ error: null }),
    delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
  }),
  rpc: () => Promise.resolve({ data: null, error: null })
};
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Shield, Zap, Sparkles, Activity, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import TasbeehHabitModal from '@/components/habits/TasbeehHabitModal';
import NamazHabitModal from '@/components/habits/NamazHabitModal';
import QuranHabitModal from '@/components/habits/QuranHabitModal';

type Habit = {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  habit_type?: 'general' | 'tasbeeh' | 'quran' | 'namaz';
  target_value?: number;
  metadata?: any;
};

export default function HabitsScreen() {
  const { colors } = useTheme();
  const { user, session } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [joinedHabitIds, setJoinedHabitIds] = useState<string[]>([]);
  const [communityStats, setCommunityStats] = useState<Record<string, { total_participants: number, community_completions: number }>>({});
  const [userCompletions, setUserCompletions] = useState<Record<string, { progress: number, is_completed: boolean, completion_metadata?: any, total_days_completed?: number }>>({});
  const [quranStats, setQuranStats] = useState<Record<string, any>>({});
  const [userParticipants, setUserParticipants] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);
  const bottomInset = Math.max(insets.bottom + 105, 120);

  const fetchHabits = useCallback(async () => {
    try {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      let joinedData: any = [];
      if (session?.user) {
        const { data } = await supabase
          .from('habit_participants')
          .select('habit_id, participant_metadata')
          .eq('user_id', session.user.id);
        joinedData = data;
      }

      setHabits(habitsData || []);
      setJoinedHabitIds((joinedData || []).map((j: any) => j.habit_id));
      
      const pMap: Record<string, any> = {};
      (joinedData || []).forEach((j: any) => pMap[j.habit_id] = j);
      setUserParticipants(pMap);

      // Fetch rich community stats and user completions for today
      const today = new Date().toISOString().split('T')[0];
      if (habitsData && habitsData.length > 0) {
        const statsMap: Record<string, any> = {};
        const completionsMap: Record<string, any> = {};
        const qStatsMap: Record<string, any> = {};

        await Promise.all(habitsData.map(async (h) => {
          const [statsRes, userCompletionRes, quranRes, totalCompletionsRes] = await Promise.all([
            supabase.rpc('get_habit_stats_v2', { p_habit_id: h.id, p_date: today }),
            session?.user ? supabase.from('habit_completions').select('progress, is_completed, completion_metadata').eq('habit_id', h.id).eq('user_id', session.user.id).eq('completion_date', today).single() : Promise.resolve({ data: null }),
            h.habit_type === 'quran' ? supabase.rpc('get_quran_stats', { p_habit_id: h.id, p_date: today }) : Promise.resolve({ data: null }),
            (session?.user && h.habit_type === 'quran') ? supabase.from('habit_completions').select('*', { count: 'exact', head: true }).eq('habit_id', h.id).eq('user_id', session.user.id).eq('is_completed', true) : Promise.resolve({ count: 0 })
          ]);

          if (!statsRes.error && statsRes.data) {
            statsMap[h.id] = statsRes.data;
          }
          if (userCompletionRes.data) {
            completionsMap[h.id] = { ...userCompletionRes.data, total_days_completed: totalCompletionsRes.count || 0 };
          } else if (totalCompletionsRes.count) {
            completionsMap[h.id] = { progress: 0, is_completed: false, total_days_completed: totalCompletionsRes.count };
          }
          if (quranRes.data) {
            qStatsMap[h.id] = quranRes.data;
          }
        }));
        
        setCommunityStats(statsMap);
        setUserCompletions(completionsMap);
        setQuranStats(qStatsMap);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHabits();
  };

  const handleJoinLeave = async (habitId: string, isJoined: boolean, readingMode?: string) => {
    if (!session?.user) return;
    
    if (isJoined) {
      await supabase.from('habit_participants').delete().eq('habit_id', habitId).eq('user_id', session.user.id);
      setJoinedHabitIds(prev => prev.filter(id => id !== habitId));
    } else {
      await supabase.from('habit_participants').insert([{ habit_id: habitId, user_id: session.user.id, participant_metadata: readingMode ? { reading_mode: readingMode } : {} }]);
      setJoinedHabitIds(prev => [...prev, habitId]);
    }
    handleRefresh();
  };

  const openHabitAction = (habit: Habit) => {
    if (habit.habit_type === 'general' || habit.habit_type === 'namaz') return;
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const toggleNamazPrayer = async (habitId: string, prayerId: string) => {
    if (!session?.user) return;
    const today = new Date().toISOString().split('T')[0];
    
    const currentStatus = userCompletions[habitId] || { progress: 0, is_completed: false, completion_metadata: {} };
    const metadata = currentStatus.completion_metadata || {};
    const prayers = metadata.prayers || [];
    
    const newPrayers = prayers.includes(prayerId) 
      ? prayers.filter((p: string) => p !== prayerId)
      : [...prayers, prayerId];
      
    const progress = newPrayers.length;
    const isCompleted = progress >= 5;
    
    // Optimistic UI update
    setUserCompletions(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], progress, is_completed: isCompleted, completion_metadata: { prayers: newPrayers } }
    }));
    
    // Backend update
    await supabase.from('habit_completions').upsert({
      habit_id: habitId,
      user_id: session.user.id,
      completion_date: today,
      progress,
      is_completed: isCompleted,
      completion_metadata: { prayers: newPrayers }
    }, { onConflict: 'habit_id,user_id,completion_date' });
  };

  const getActionButtonText = (type?: string) => {
    switch (type) {
      case 'tasbeeh': return 'Start Tasbeeh';
      case 'quran': return 'Read Quran';
      case 'namaz': return 'Log Prayers';
      default: return 'Participating';
    }
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const isJoined = joinedHabitIds.includes(item.id);
    const stats = communityStats[item.id] || { total_participants: 0, community_completions: 0 };
    const userStatus = userCompletions[item.id] || { progress: 0, is_completed: false, completion_metadata: {} };
    
    // Calculate progress percentage for user
    const target = item.target_value || 1;
    const progressPercent = Math.min(100, Math.max(0, (userStatus.progress / target) * 100));

    if (item.habit_type === 'namaz') {
      return renderNamazCard(item, isJoined, stats, userStatus, progressPercent);
    }

    if (item.habit_type === 'quran') {
      return renderQuranCard(item, isJoined, userStatus);
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Sparkles color={colors.primary} size={20} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{item.category}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.secondaryText + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.secondaryText }]}>{item.frequency}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={[styles.description, { color: colors.secondaryText }]}>{item.description}</Text>

        <View style={styles.statsContainer}>
          <View style={[styles.statPill, { backgroundColor: colors.primary + '15' }]}>
            <Users color={colors.primary} size={14} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
              {stats.total_participants} Participating
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: '#3b82f615' }]}>
            <Activity color="#3b82f6" size={14} style={{ marginRight: 4 }} />
            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '700' }}>
              {stats.community_completions} Completions Today
            </Text>
          </View>
        </View>

        {isJoined && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={{ color: colors.secondaryText, fontSize: 12, fontWeight: '600' }}>Your Daily Progress</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                {userStatus.progress} / {target}
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progressPercent}%` }]} />
            </View>
          </View>
        )}
        
        {session?.user ? (
          <View>
            <TouchableOpacity 
              style={[
                styles.joinBtn, 
                { 
                  backgroundColor: userStatus.is_completed ? '#10b981' : (isJoined ? (item.habit_type !== 'general' ? colors.primary : colors.card) : colors.primary), 
                  borderColor: userStatus.is_completed ? '#10b981' : (isJoined ? (item.habit_type !== 'general' ? colors.primary : colors.border) : colors.primary), 
                  borderWidth: 1,
                  opacity: userStatus.is_completed ? 0.8 : 1,
                }
              ]}
              disabled={userStatus.is_completed}
              onPress={() => isJoined ? openHabitAction(item) : handleJoinLeave(item.id, false)}
              activeOpacity={0.8}
            >
              {userStatus.is_completed ? (
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>✓ Completed Today</Text>
              ) : (
                <>
                  {isJoined && item.habit_type === 'general' && <Zap color={colors.primary} size={16} style={{ marginRight: 6 }} />}
                  <Text style={{ color: isJoined && item.habit_type === 'general' ? colors.primary : '#FFF', fontWeight: '800', fontSize: 15 }}>
                    {isJoined ? getActionButtonText(item.habit_type) : 'Join Habit'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {isJoined && (
              <TouchableOpacity onPress={() => handleJoinLeave(item.id, true)} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Leave Habit</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.joinBtn, 
              { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1 }
            ]}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>
              Sign Up to Join
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderNamazCard = (item: Habit, isJoined: boolean, stats: any, userStatus: any, progressPercent: number) => {
    const prayersList = [
      { id: 'fajr', label: 'Fajr' },
      { id: 'dhuhr', label: 'Zuhr' },
      { id: 'asr', label: 'Asr' },
      { id: 'maghrib', label: 'Maghrib' },
      { id: 'isha', label: 'Isha' },
    ];
    
    const completedPrayers = userStatus.completion_metadata?.prayers || [];
    const missedCount = 5 - completedPrayers.length;

    // Dynamic Quotes
    let quote = "";
    if (completedPrayers.length === 5) {
      quote = `"The first matter that the slave will be brought to account for on the Day of Judgment is the prayer." (Hadith, Tirmidhi)`;
    } else if (completedPrayers.length > 0) {
      quote = `"And establish prayer for My remembrance." (Qur'an 20:14)\nKeep going, Allah loves consistency.`;
    } else {
      quote = `"Verily, with hardship comes ease." (Qur'an 94:6)\nIt is never too late to pray. Begin with your next Salah.`;
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconBox, { backgroundColor: '#05966915' }]}>
              <Sparkles color="#059669" size={20} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: '#05966920' }]}>
                  <Text style={[styles.badgeText, { color: '#059669' }]}>NAMAZ</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.secondaryText + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.secondaryText }]}>{item.frequency}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.secondaryText }]}>{item.description}</Text>

        {isJoined ? (
          <>
            {/* Interactive Prayers Row */}
            <View style={styles.prayersRow}>
              {prayersList.map((p) => {
                const isChecked = completedPrayers.includes(p.id);
                return (
                  <TouchableOpacity 
                    key={p.id}
                    onPress={() => toggleNamazPrayer(item.id, p.id)}
                    style={[
                      styles.prayerCircleBtn, 
                      { 
                        backgroundColor: isChecked ? '#10b981' : colors.card,
                        borderColor: isChecked ? '#10b981' : colors.border
                      }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={{ 
                      fontSize: 12, 
                      fontWeight: '800', 
                      color: isChecked ? '#FFF' : colors.secondaryText 
                    }}>
                      {p.label[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Legend / Status text */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 16 }}>
              <Text style={{ fontSize: 13, color: '#10b981', fontWeight: '700' }}>{completedPrayers.length} Completed</Text>
              <Text style={{ fontSize: 13, color: colors.secondaryText, fontWeight: '700' }}>{missedCount} Pending</Text>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={{ color: colors.secondaryText, fontSize: 12, fontWeight: '600' }}>Daily Completion</Text>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  {userStatus.progress} / 5
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFill, { backgroundColor: '#10b981', width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* Motivational Quote */}
            <View style={[styles.quoteContainer, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.quoteText, { color: colors.primary }]}>{quote}</Text>
            </View>

            <TouchableOpacity onPress={() => handleJoinLeave(item.id, true)} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Leave Habit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={[styles.statPill, { backgroundColor: colors.primary + '15' }]}>
                <Users color={colors.primary} size={14} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
                  {stats.total_participants} Participating
                </Text>
              </View>
            </View>
            
            {session?.user ? (
              <TouchableOpacity 
                style={[styles.joinBtn, { backgroundColor: '#059669', borderColor: '#059669', borderWidth: 1 }]}
                onPress={() => handleJoinLeave(item.id, false)}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Join Namaz</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.joinBtn, { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1 }]}
                onPress={() => router.push('/(auth)/signup')}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Sign Up to Join</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderQuranCard = (item: Habit, isJoined: boolean, currentStatus: any) => {
    const qStats = quranStats[item.id] || {};
    const surah = item.metadata?.surah || "Any Surah";
    const modes = [
      { id: '3_days', label: '3 Days Plan', days: 3 },
      { id: '5_days', label: '5 Days Plan', days: 5 },
      { id: '10_days', label: '10 Days Plan', days: 10 },
    ];
    
    const participantMode = userParticipants[item.id]?.participant_metadata?.reading_mode;
    const currentMode = modes.find(m => m.id === participantMode);
    const targetDays = currentMode ? currentMode.days : 1;
    const totalDaysCompleted = currentStatus.total_days_completed || 0;
    const overallProgressPercent = Math.min(100, (totalDaysCompleted / targetDays) * 100);
    
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <BookOpen color={colors.primary} size={20} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>QURAN</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.secondaryText + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.secondaryText }]}>Surah: {surah}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.secondaryText, marginBottom: 16 }]}>{item.description}</Text>

        {!isJoined ? (
          <View>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12, fontSize: 15 }}>Select a Reading Plan:</Text>
            {modes.map(mode => {
              const modeStats = qStats[mode.id] || { total: 0, completed: 0 };
              return (
                <TouchableOpacity 
                  key={mode.id}
                  style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={() => session?.user ? handleJoinLeave(item.id, false, mode.id) : router.push('/(auth)/signup')}
                >
                  <View>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{mode.label}</Text>
                    <Text style={{ color: colors.secondaryText, fontSize: 12, marginTop: 4 }}>
                      <Users size={12} color={colors.secondaryText} style={{marginRight: 4}} /> {modeStats.total} joined • {modeStats.completed} finished today
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Join</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ) : (
          <View>
            <View style={{ backgroundColor: colors.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 4 }}>
                {modes.find(m => m.id === participantMode)?.label || 'Reading Plan'}
              </Text>
              <Text style={{ color: colors.secondaryText, fontSize: 13, marginBottom: 16 }}>
                You are currently enrolled in this timeline. Make sure to read your daily portion!
              </Text>
              
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={{ color: colors.secondaryText, fontSize: 12, fontWeight: '600' }}>Overall Progress</Text>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                    {totalDaysCompleted} / {targetDays} Days Completed
                  </Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: '#10b981', width: `${overallProgressPercent}%` }]} />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.logBtn, { backgroundColor: currentStatus.is_completed ? '#10b981' : colors.primary, marginTop: 16 }]} 
                onPress={() => {
                   if (!currentStatus.is_completed) {
                     // Optimistically update
                     setUserCompletions(prev => ({
                       ...prev,
                       [item.id]: {
                          ...prev[item.id],
                          is_completed: true,
                          total_days_completed: (prev[item.id]?.total_days_completed || 0) + 1
                       }
                     }));

                     supabase.from('habit_completions').upsert({
                       habit_id: item.id,
                       user_id: session!.user.id,
                       completion_date: new Date().toISOString().split('T')[0],
                       progress: 1,
                       is_completed: true
                     }, { onConflict: 'habit_id,user_id,completion_date' }).then(() => handleRefresh());
                   }
                }}
              >
                <Text style={styles.logBtnText}>
                  {currentStatus.is_completed ? '✓ Completed Today' : 'Mark Daily Portion Complete'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={() => handleJoinLeave(item.id, true)} style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>Leave Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TasbeehHabitModal 
        visible={modalVisible && selectedHabit?.habit_type === 'tasbeeh'} 
        habit={selectedHabit} 
        onClose={() => setModalVisible(false)} 
        onComplete={handleRefresh} 
      />
      <NamazHabitModal 
        visible={modalVisible && selectedHabit?.habit_type === 'namaz'} 
        habit={selectedHabit} 
        onClose={() => setModalVisible(false)} 
        onComplete={handleRefresh} 
      />
      <QuranHabitModal 
        visible={modalVisible && selectedHabit?.habit_type === 'quran'} 
        habit={selectedHabit} 
        onClose={() => setModalVisible(false)} 
        onComplete={handleRefresh} 
      />

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <ScreenHeader 
              title="Global Habits" 
              subtitle="Join challenges to build discipline alongside the community." 
              topInset={topInset} 
            />
            {!session?.user && (
              <View style={[styles.guestBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                <Text style={[styles.guestTitle, { color: colors.text }]}>Start Your Journey Today</Text>
                <Text style={[styles.guestSub, { color: colors.secondaryText }]}>Create a free account to participate in habits, track your streaks, and build daily discipline.</Text>
                <View style={styles.guestActionRow}>
                  <TouchableOpacity style={[styles.guestBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.guestBtnText}>Create Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.guestBtnOutline} onPress={() => router.push('/(auth)/login')}>
                    <Text style={[styles.guestBtnOutlineText, { color: colors.text }]}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Users color={colors.secondaryText} size={48} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No habits available yet.</Text>
            <Text style={{ color: colors.secondaryText, textAlign: 'center', marginTop: 8 }}>Admins haven't published any habits. Check back later!</Text>
          </View>
        }
      />

      {user?.role === 'admin' && (
        <TouchableOpacity 
          style={[styles.adminFab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(admin)')}
          activeOpacity={0.9}
        >
          <Shield color="#FFF" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerArea: { marginBottom: 16 },
  list: { padding: 20, paddingBottom: 120 },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  progressSection: {
    backgroundColor: '#00000004',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  logBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logBtnText: {
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 15,
  },
  joinBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, padding: 20 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  guestBanner: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  guestTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  guestSub: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  guestActionRow: { flexDirection: 'row', gap: 12 },
  guestBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  guestBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  guestBtnOutline: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  guestBtnOutlineText: { fontWeight: '800', fontSize: 14 },
  adminFab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  prayersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  prayerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteContainer: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
