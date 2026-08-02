import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MemberProgressList } from '@/components/hub/MemberProgressList';
import { HubService } from '@/services/hubService';
import { HabitHub, HubMember, HubGoal, HubGoalCompletion } from '@/types/hub';
import { getTodayDateString } from '@/utils/dateUtils';

export default function HubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, firebaseUser } = useAuth();

  const [hub, setHub] = useState<HabitHub | null>(null);
  const [members, setMembers] = useState<HubMember[]>([]);
  const [goals, setGoals] = useState<HubGoal[]>([]);
  const [completions, setCompletions] = useState<HubGoalCompletion[]>([]);

  // Modals
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [inviting, setInviting] = useState(false);

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [addingGoal, setAddingGoal] = useState(false);

  const todayStr = getTodayDateString();

  useEffect(() => {
    if (!id) return;

    const unsubscribe = HubService.listenToHubDetails(id, todayStr, (data) => {
      setHub(data.hub);
      setMembers(data.members);
      setGoals(data.goals);
      setCompletions(data.completions);
    });

    return () => unsubscribe();
  }, [id, todayStr]);

  const isOwner = hub?.ownerId === firebaseUser?.uid;

  const handleInviteMember = async () => {
    if (!targetUsername.trim() || !id) return;

    setInviting(true);
    try {
      const invited = await HubService.inviteMemberByUsername(id, targetUsername);
      setInviteModalVisible(false);
      setTargetUsername('');
      Alert.alert('Invite Sent 📩', `Invite sent to @${invited.username}. They will see it in their Habit Hubs tab!`);
    } catch (e: any) {
      Alert.alert('Invite Error', e.message || 'Could not send invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim() || !id) return;

    setAddingGoal(true);
    try {
      await HubService.createHubGoal(id, goalTitle, goalDesc);
      setGoalModalVisible(false);
      setGoalTitle('');
      setGoalDesc('');
      Alert.alert('Group Goal Added 🎯', `"${goalTitle}" is now active for all Hub members!`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not add group goal.');
    } finally {
      setAddingGoal(false);
    }
  };

  const handleToggleCompletion = async (goalId: string) => {
    if (!id) return;
    try {
      await HubService.toggleMemberCompletion(id, goalId, todayStr);
    } catch (e: any) {
      Alert.alert('Error', 'Could not update completion status.');
    }
  };

  if (!hub) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingBox}>
          <Text style={{ color: colors.secondaryText }}>Loading Habit Hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const acceptedMembers = members.filter((m) => m.status === 'accepted');
  const pendingMembers = members.filter((m) => m.status === 'pending');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hub Title Banner */}
        <Card variant="goldGlow" style={styles.hubHeaderCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hubTitle, { color: colors.text }]}>{hub.name}</Text>
              <Text style={[styles.ownerTag, { color: colors.accentGold }]}>
                Created by @{hub.ownerUsername}
              </Text>
            </View>
            <Text style={styles.hubIcon}>👥</Text>
          </View>
          {hub.description ? (
            <Text style={[styles.hubDesc, { color: colors.secondaryText }]}>{hub.description}</Text>
          ) : null}
        </Card>

        {/* Member Action Controls */}
        <View style={styles.actionRow}>
          <Button
            title="+ Invite by @username"
            size="small"
            variant="outline"
            onPress={() => setInviteModalVisible(true)}
            style={{ flex: 1, marginRight: 6 }}
          />
          {isOwner ? (
            <Button
              title="+ Add Group Goal"
              size="small"
              variant="primary"
              onPress={() => setGoalModalVisible(true)}
              style={{ flex: 1, marginLeft: 6 }}
            />
          ) : null}
        </View>

        {/* Member List Chips */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Circle Members ({acceptedMembers.length})
        </Text>
        <View style={styles.membersChipRow}>
          {acceptedMembers.map((m) => (
            <View key={m.userId} style={[styles.memberBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.memberBadgeText, { color: colors.primary }]}>
                @{m.username} {m.role === 'owner' ? '👑' : ''}
              </Text>
            </View>
          ))}
          {pendingMembers.map((m) => (
            <View key={m.userId} style={[styles.memberBadge, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
              <Text style={[styles.memberBadgeText, { color: colors.warning }]}>
                @{m.username} (Pending ⏳)
              </Text>
            </View>
          ))}
        </View>

        {/* Active Group Goals Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Group Goals for Today ({goals.length})
        </Text>

        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Group Goals Active</Text>
            <Text style={[styles.emptySub, { color: colors.secondaryText }]}>
              {isOwner
                ? 'As the Hub Owner, add your first group habit so everyone can complete it together!'
                : 'Waiting for the Hub Owner to add group goals.'}
            </Text>
            {isOwner ? (
              <Button
                title="+ Add Group Goal"
                variant="primary"
                onPress={() => setGoalModalVisible(true)}
                style={{ marginTop: 14 }}
              />
            ) : null}
          </Card>
        ) : (
          goals.map((goal) => (
            <MemberProgressList
              key={goal.id}
              goal={goal}
              members={members}
              completions={completions}
              currentUserId={firebaseUser?.uid || ''}
              onToggleMyCompletion={handleToggleCompletion}
            />
          ))
        )}

        {/* Invite Member Modal */}
        <Modal visible={inviteModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Member</Text>
              <Text style={[styles.modalSub, { color: colors.secondaryText }]}>
                Enter the exact 619 username (e.g. @usman619)
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Username *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. usman619"
                autoCapitalize="none"
                placeholderTextColor={colors.mutedText}
                value={targetUsername}
                onChangeText={setTargetUsername}
              />

              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setInviteModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Send Invite"
                  variant="primary"
                  loading={inviting}
                  disabled={!targetUsername.trim()}
                  onPress={handleInviteMember}
                  style={{ flex: 2, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Create Group Goal Modal */}
        <Modal visible={goalModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Group Goal</Text>
              <Text style={[styles.modalSub, { color: colors.secondaryText }]}>
                Every member in this Hub will complete this goal.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Goal Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Read 10 Pages of Quran"
                placeholderTextColor={colors.mutedText}
                value={goalTitle}
                onChangeText={setGoalTitle}
              />

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Surah Yaseen after Fajr"
                placeholderTextColor={colors.mutedText}
                value={goalDesc}
                onChangeText={setGoalDesc}
              />

              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setGoalModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Add Goal"
                  variant="primary"
                  loading={addingGoal}
                  disabled={!goalTitle.trim()}
                  onPress={handleCreateGoal}
                  style={{ flex: 2, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubHeaderCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hubTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  ownerTag: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  hubIcon: {
    fontSize: 32,
  },
  hubDesc: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  membersChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
