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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HubCard } from '@/components/hub/HubCard';
import { PendingInviteCard } from '@/components/hub/PendingInviteCard';
import { HubService } from '@/services/hubService';
import { HabitHub, HubMember } from '@/types/hub';

export default function HubsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, firebaseUser, loading } = useAuth();

  const [activeHubs, setActiveHubs] = useState<HabitHub[]>([]);
  const [pendingInvites, setPendingInvites] = useState<{ hub: HabitHub; member: HubMember }[]>([]);

  // Create Hub Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [hubName, setHubName] = useState('');
  const [hubDesc, setHubDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Join Hub by Code Modal
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const activeUserId = user?.uid || firebaseUser?.uid;

  useEffect(() => {
    if (!activeUserId) return;

    const unsubscribe = HubService.listenToUserHubs(activeUserId, (hubs, invites) => {
      setActiveHubs(hubs);
      setPendingInvites(invites);
    });

    return () => unsubscribe();
  }, [activeUserId]);

  const handleCreateHub = async () => {
    if (!hubName.trim()) return;

    setCreating(true);
    try {
      const newHub = await HubService.createHub(hubName, hubDesc);
      setModalVisible(false);
      setHubName('');
      setHubDesc('');
      Alert.alert(
        'Hub Created 🎉',
        `"${newHub.name}" is active!\nUnique Code: ${newHub.hubCode || '619-HUB'}\nShare this code with friends so they can request to join!`
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not create Hub.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;

    setJoining(true);
    try {
      const targetHub = await HubService.requestJoinHubByCode(joinCode);
      setJoinModalVisible(false);
      setJoinCode('');
      Alert.alert(
        'Request Sent 📩',
        `Your request to join "${targetHub.name}" has been sent to @${targetHub.ownerUsername} for approval!`
      );
    } catch (e: any) {
      Alert.alert('Join Request Error', e.message || 'Could not send join request.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={{ color: colors.secondaryText, marginTop: 12 }}>Syncing Habit Hubs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeUserId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Text style={styles.emoji}>👥</Text>
          <Text style={[styles.authTitle, { color: colors.text }]}>Habit Hubs & Circles</Text>
          <Text style={[styles.authSub, { color: colors.secondaryText }]}>
            Sign in to create Habit Hubs, invite friends by username, and complete group goals together!
          </Text>
          <Card style={styles.authCard}>
            <Button
              title="Sign In to Account"
              variant="primary"
              size="large"
              onPress={() => router.push('/(auth)/login')}
              style={{ marginBottom: 10 }}
            />
            <Button
              title="Create Free Account"
              variant="outline"
              size="large"
              onPress={() => router.push('/(auth)/signup')}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Handle & Action Controls Banner */}
        <View style={styles.topBanner}>
          <View>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>Habit Hubs</Text>
            <Text style={[styles.bannerUser, { color: colors.accentGold }]}>
              Logged in as <Text style={{ fontWeight: '800' }}>@{user?.username || 'user'}</Text>
            </Text>
          </View>
          <View style={styles.headerButtonRow}>
            <Button
              title="🔑 Join Code"
              size="small"
              variant="outline"
              onPress={() => setJoinModalVisible(true)}
              style={{ marginRight: 6 }}
            />
            <Button
              title="+ Create Hub"
              size="small"
              variant="primary"
              onPress={() => setModalVisible(true)}
            />
          </View>
        </View>

        {/* Pending Invites / Requests Section */}
        {pendingInvites.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.accentGold }]}>
              Pending Invites & Requests ({pendingInvites.length})
            </Text>
            {pendingInvites.map((item) => (
              <PendingInviteCard
                key={item.hub.id}
                hub={item.hub}
                member={item.member}
                onRespond={() => {}}
              />
            ))}
          </View>
        ) : null}

        {/* Active Joined Hubs */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Joined Circles ({activeHubs.length})
        </Text>

        {activeHubs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Habit Hubs Joined Yet</Text>
            <Text style={[styles.emptySub, { color: colors.secondaryText }]}>
              Create a group circle or enter a 6-character Unique Hub Code (e.g. 619-FAJR) to request to join!
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button
                title="🔑 Join with Code"
                variant="outline"
                onPress={() => setJoinModalVisible(true)}
                style={{ flex: 1, marginRight: 6 }}
              />
              <Button
                title="+ Create Hub"
                variant="primary"
                onPress={() => setModalVisible(true)}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>
          </Card>
        ) : (
          activeHubs.map((hub) => (
            <HubCard
              key={hub.id}
              hub={hub}
              onPress={() => router.push(`/hub/${hub.id}` as any)}
            />
          ))
        )}

        {/* Create Hub Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Habit Hub</Text>
              <Text style={[styles.modalSub, { color: colors.secondaryText }]}>
                A shared circle where everyone completes goals together.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Hub Name *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Fajr Warriors or Daily 619 Squad"
                placeholderTextColor={colors.mutedText}
                value={hubName}
                onChangeText={setHubName}
              />

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Daily Quran and workout circle"
                placeholderTextColor={colors.mutedText}
                value={hubDesc}
                onChangeText={setHubDesc}
              />

              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Create Hub"
                  variant="primary"
                  loading={creating}
                  disabled={!hubName.trim()}
                  onPress={handleCreateHub}
                  style={{ flex: 2, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Join Hub by Code Modal */}
        <Modal visible={joinModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Join Hub with Code 🔑</Text>
              <Text style={[styles.modalSub, { color: colors.secondaryText }]}>
                Enter the Unique 6-character Hub Code (e.g. 619-FAJR) to request to join.
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>Unique Hub Code *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.primary, borderColor: colors.primary, fontWeight: '800', letterSpacing: 2 }]}
                placeholder="619-FAJR"
                autoCapitalize="characters"
                placeholderTextColor={colors.mutedText}
                value={joinCode}
                onChangeText={setJoinCode}
              />

              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setJoinModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Request to Join"
                  variant="primary"
                  loading={joining}
                  disabled={!joinCode.trim()}
                  onPress={handleJoinByCode}
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
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  authSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 20,
  },
  authCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
  },
  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtonRow: {
    flexDirection: 'row',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  bannerUser: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 10,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
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
