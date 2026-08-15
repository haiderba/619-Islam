import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Users, ListTodo, ShieldCheck, X, ChevronRight, Mail, Calendar } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Habit = {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  status: string;
  habit_type?: 'general' | 'tasbeeh' | 'quran' | 'namaz';
  target_value?: number;
  participants_count?: number;
};

type UserProfile = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  created_at: string;
};

const HABIT_TYPES = [
  { id: 'general', label: 'General', icon: '📝' },
  { id: 'tasbeeh', label: 'Tasbeeh', icon: '📿' },
  { id: 'quran', label: 'Quran', icon: '📖' },
  { id: 'namaz', label: 'Namaz', icon: '🕌' }
] as const;

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { session } = useAuth();

  const [activeTab, setActiveTab] = useState<'habits' | 'users'>('habits');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalHabits: 0 });

  // Habit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Detail Modal State
  const [userDetailVisible, setUserDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userHabits, setUserHabits] = useState<any[]>([]);
  const [loadingUserHabits, setLoadingUserHabits] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [habitType, setHabitType] = useState<'general'|'tasbeeh'|'quran'|'namaz'>('general');
  const [targetValue, setTargetValue] = useState('1');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchHabits(),
      fetchUsers(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats({
        totalUsers: res.data.totalUsers || 0,
        totalHabits: res.data.totalHabits || 0
      });
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  const fetchHabits = async () => {
    try {
      const res = await api.get('/admin/habits');
      setHabits(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHabit = async () => {
    if (!title || !description || !category) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/habits', {
        title,
        description,
        category,
        frequency: 'daily',
        status: 'active',
        habit_type: habitType,
        target_value: parseInt(targetValue) || 1,
      });
      setHabits([{ ...res.data, participants_count: 0 } as Habit, ...habits]);
      setStats(prev => ({ ...prev, totalHabits: prev.totalHabits + 1 }));
      resetForm();
      setModalVisible(false);
      Alert.alert('Success', 'Global habit has been published.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setHabitType('general');
    setTargetValue('1');
  };

  const handleDeleteHabit = async (id: string) => {
    Alert.alert('Confirm Delete', 'Delete this habit globally for all users?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/admin/habits/${id}`);
            setHabits(habits.filter(h => h.id !== id));
            setStats(prev => ({ ...prev, totalHabits: prev.totalHabits - 1 }));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
      }}
    ]);
  };

  const viewUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    setUserDetailVisible(true);
    setLoadingUserHabits(true);

    try {
      const res = await api.get(`/admin/users/${user.id}/habits`);
      setUserHabits(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoadingUserHabits(false);
  };

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <Card style={styles.habitCard}>
      <View style={styles.habitIconBg}>
        <Text style={{ fontSize: 24 }}>
          {HABIT_TYPES.find(t => t.id === item.habit_type)?.icon || '📝'}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardSub, { color: colors.secondaryText }]}>{item.category} • {item.participants_count} users</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteHabit(item.id)} style={styles.deleteBtn}>
        <Trash2 color={colors.danger} size={18} />
      </TouchableOpacity>
    </Card>
  );

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => viewUserDetails(item)}>
      <Card style={styles.userItemCard}>
        <View style={[styles.userAvatar, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
            {item.displayName ? item.displayName[0].toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.displayName || 'Unnamed User'}</Text>
          <Text style={[styles.cardSub, { color: colors.secondaryText }]}>{item.email}</Text>
        </View>
        {item.role === 'admin' && (
          <View style={[styles.adminBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>ADMIN</Text>
          </View>
        )}
        <ChevronRight color={colors.border} size={20} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* STATS HEADER */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Users color={colors.primary} size={20} />
          <Text style={[styles.statNum, { color: colors.text }]}>{stats.totalUsers}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Total Users</Text>
        </Card>
        <Card style={styles.statCard}>
          <ListTodo color={colors.accentGold} size={20} />
          <Text style={[styles.statNum, { color: colors.text }]}>{stats.totalHabits}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Active Habits</Text>
        </Card>
      </View>

      {/* TABS */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('habits')}
          style={[styles.tab, activeTab === 'habits' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'habits' ? colors.primary : colors.secondaryText }]}>Habits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('users')}
          style={[styles.tab, activeTab === 'users' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'users' ? colors.primary : colors.secondaryText }]}>Users</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'habits' ? habits : users}
          keyExtractor={item => item.id}
          renderItem={activeTab === 'habits' ? renderHabitItem : renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: colors.secondaryText }}>No {activeTab} found.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      {activeTab === 'habits' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#FFF" size={28} />
        </TouchableOpacity>
      )}

      {/* CREATE HABIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Publish New Habit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={colors.secondaryText} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.text }]}>Habit Information</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                placeholder="Title (e.g. Daily Quran Reading)"
                placeholderTextColor={colors.mutedText}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, height: 80 }]}
                placeholder="Description"
                multiline
                placeholderTextColor={colors.mutedText}
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                placeholder="Category (Spiritual, Fitness, etc.)"
                placeholderTextColor={colors.mutedText}
                value={category}
                onChangeText={setCategory}
              />

              <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Integration Type</Text>
              <View style={styles.typeGrid}>
                {HABIT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      habitType === type.id && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => setHabitType(type.id)}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{type.icon}</Text>
                    <Text style={[
                      styles.typeLabel,
                      { color: colors.secondaryText },
                      habitType === type.id && { color: colors.primary, fontWeight: '800' }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(habitType === 'tasbeeh' || habitType === 'namaz') && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {habitType === 'tasbeeh' ? 'Target Count (e.g. 100 beads)' : 'Target Count (e.g. 5 prayers)'}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    placeholder="Value"
                    keyboardType="number-pad"
                    placeholderTextColor={colors.mutedText}
                    value={targetValue}
                    onChangeText={setTargetValue}
                  />
                </View>
              )}

              <Button
                title="Publish Globally"
                loading={isSubmitting}
                onPress={handleCreateHabit}
                style={{ marginTop: 24, marginBottom: 40 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* USER DETAIL MODAL */}
      <Modal visible={userDetailVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, height: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>User Profile</Text>
              <TouchableOpacity onPress={() => setUserDetailVisible(false)}>
                <X color={colors.secondaryText} size={24} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                  <View style={[styles.detailAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ color: colors.primary, fontSize: 32, fontWeight: 'bold' }}>
                      {selectedUser.displayName ? selectedUser.displayName[0].toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <Text style={[styles.detailName, { color: colors.text }]}>{selectedUser.displayName || 'User'}</Text>
                  <Text style={[styles.detailHandle, { color: colors.secondaryText }]}>@{selectedUser.username}</Text>

                  <View style={styles.infoBox}>
                    <View style={styles.infoItem}>
                      <Mail color={colors.primary} size={16} />
                      <Text style={[styles.infoText, { color: colors.text }]}>{selectedUser.email}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Calendar color={colors.primary} size={16} />
                      <Text style={[styles.infoText, { color: colors.text }]}>Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <ShieldCheck color={colors.primary} size={16} />
                      <Text style={[styles.infoText, { color: colors.text }]}>Role: {selectedUser.role.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Joined Habits</Text>
                {loadingUserHabits ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                ) : userHabits.length > 0 ? (
                  userHabits.map((item, index) => (
                    <Card key={index} style={styles.miniHabitCard}>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{item.habits?.title}</Text>
                      <Text style={{ color: colors.secondaryText, fontSize: 12 }}>{item.habits?.category}</Text>
                    </Card>
                  ))
                ) : (
                  <Text style={{ color: colors.secondaryText, fontStyle: 'italic', marginTop: 10 }}>No habits joined yet.</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 20,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 16,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
  },
  habitIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 8 },
  userItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    width: (SCREEN_WIDTH - 68) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeLabel: { fontSize: 14 },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  detailCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailName: { fontSize: 20, fontWeight: '800' },
  detailHandle: { fontSize: 14, marginBottom: 20 },
  infoBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: { fontSize: 14, fontWeight: '500' },
  miniHabitCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  }
});
