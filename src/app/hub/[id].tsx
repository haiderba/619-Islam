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
  TouchableOpacity,
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

  // Modals & Chat
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [inviting, setInviting] = useState(false);

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [addingGoal, setAddingGoal] = useState(false);

  // Group Motivation Chat Messages
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; time: string }[]
  >([
    {
      id: 'm1',
      sender: 'System',
      text: 'Welcome to the Habit Hub! Stay consistent and support each other. 🕌',
      time: '08:00 AM',
    },
  ]);

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

  const isOwner = hub?.ownerId === firebaseUser?.uid || hub?.ownerId === user?.uid;

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

  // Hub Owner Approve / Reject Request
  const handleOwnerRespondRequest = async (memberUserId: string, username: string, approve: boolean) => {
    if (!id) return;
    try {
      await HubService.respondToJoinRequest(id, memberUserId, approve);
      Alert.alert(
        approve ? 'Request Approved 🎉' : 'Request Declined ✕',
        approve
          ? `@${username} is now an active member of "${hub?.name}"!`
          : `Declined join request from @${username}.`
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update request.');
    }
  };

  // Nudge Member Engine
  const handleNudgeMember = (username: string) => {
    Alert.alert(
      'Nudge Sent 🔔',
      `Sent a reminder notification to @${username}! "Don't break your streak in ${hub?.name}."`
    );
  };

  // Send Group Chat Note
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: user?.username || 'member',
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatMessage('');
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

  // Compute Leaderboard Rankings (Count of completions today per user)
  const leaderboard = acceptedMembers
    .map((m) => {
      const count = completions.filter((c) => c.userId === m.userId && c.completed).length;
      return { member: m, count };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hub Title Banner with Unique Hub Code */}
        <Card variant="goldGlow" style={styles.hubHeaderCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hubTitle, { color: colors.text }]}>{hub.name}</Text>
              <Text style={[styles.ownerTag, { color: colors.accentGold }]}>
                Created by @{hub.ownerUsername}
              </Text>
            </View>
            <View style={[styles.codeBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.codeBadgeText}>Code: {hub.hubCode || '619-HUB'}</Text>
            </View>
          </View>
          {hub.description ? (
            <Text style={[styles.hubDesc, { color: colors.secondaryText }]}>{hub.description}</Text>
          ) : null}
        </Card>

        {/* Member Action Controls */}
        <View style={styles.actionRow}>
          <Button
            title="+ Invite @username"
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

        {/* Pending Join Requests Card for Hub Owner */}
        {isOwner && pendingMembers.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.warning }]}>
              Pending Join Requests ({pendingMembers.length})
            </Text>
            <Card style={styles.card}>
              {pendingMembers.map((m) => (
                <View key={m.userId} style={styles.requestRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.requestUser, { color: colors.text }]}>@{m.username}</Text>
                    <Text style={[styles.requestSub, { color: colors.secondaryText }]}>Requested to join circle</Text>
                  </View>
                  <View style={styles.requestBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOwnerRespondRequest(m.userId, m.username, false)}
                      style={[styles.rejectBtn, { borderColor: colors.danger }]}
                    >
                      <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 12 }}>Reject ✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOwnerRespondRequest(m.userId, m.username, true)}
                      style={[styles.approveBtn, { backgroundColor: colors.primary }]}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Approve ✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Hub Leaderboard Section */}
        <Text style={[styles.sectionTitle, { color: colors.accentGold }]}>
          🏆 Hub Leaderboard (Today's Streak Rank)
        </Text>
        <Card style={styles.card}>
          {leaderboard.map((item, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '✨';
            const isMe = item.member.userId === (user?.uid || firebaseUser?.uid);
            return (
              <View
                key={item.member.userId}
                style={[
                  styles.leaderboardRow,
                  isMe && { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 8 },
                ]}
              >
                <Text style={styles.rankText}>{medal} #{index + 1}</Text>
                <Text style={[styles.memberName, { color: colors.text }]}>
                  @{item.member.username} {item.member.role === 'owner' ? '👑' : ''}
                </Text>
                <Text style={[styles.scoreText, { color: colors.primary }]}>
                  {item.count} / {goals.length} Goals
                </Text>
                {item.count < goals.length && !isMe ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleNudgeMember(item.member.username)}
                    style={[styles.nudgeBtn, { backgroundColor: colors.warning }]}
                  >
                    <Text style={styles.nudgeText}>Nudge 🔔</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </Card>

        {/* Active Group Goals Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
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
              currentUserId={user?.uid || firebaseUser?.uid || ''}
              onToggleMyCompletion={handleToggleCompletion}
            />
          ))
        )}

        {/* Live Group Motivation Chat Stream */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
          💬 Circle Motivation Stream
        </Text>
        <Card style={styles.card}>
          {messages.map((m) => (
            <View key={m.id} style={styles.chatRow}>
              <Text style={[styles.chatSender, { color: colors.primary }]}>@{m.sender}:</Text>
              <Text style={[styles.chatText, { color: colors.text }]}>{m.text}</Text>
              <Text style={[styles.chatTime, { color: colors.mutedText }]}>{m.time}</Text>
            </View>
          ))}

          <View style={styles.chatInputRow}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Send a motivational note or Dua..."
              placeholderTextColor={colors.mutedText}
              value={chatMessage}
              onChangeText={setChatMessage}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendMessage}
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </Card>

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
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
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
  codeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
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
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  requestUser: {
    fontSize: 14,
    fontWeight: '800',
  },
  requestSub: {
    fontSize: 11,
    marginTop: 2,
  },
  requestBtnRow: {
    flexDirection: 'row',
  },
  rejectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  approveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '900',
    width: 50,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
    marginRight: 8,
  },
  nudgeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  nudgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatSender: {
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
  },
  chatText: {
    fontSize: 13,
    flex: 1,
  },
  chatTime: {
    fontSize: 10,
    marginLeft: 6,
  },
  chatInputRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    borderWidth: 1,
  },
  sendBtn: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
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
