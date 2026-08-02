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
  const { user, firebaseUser } = useAuth();

  const [activeHubs, setActiveHubs] = useState<HabitHub[]>([]);
  const [pendingInvites, setPendingInvites] = useState<{ hub: HabitHub; member: HubMember }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // New Hub Form
  const [hubName, setHubName] = useState('');
  const [hubDesc, setHubDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = HubService.listenToUserHubs(firebaseUser.uid, (hubs, invites) => {
      setActiveHubs(hubs);
      setPendingInvites(invites);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const handleCreateHub = async () => {
    if (!hubName.trim()) return;

    setCreating(true);
    try {
      const newHub = await HubService.createHub(hubName, hubDesc);
      setModalVisible(false);
      setHubName('');
      setHubDesc('');
      Alert.alert('Hub Created 🎉', `"${newHub.name}" is active. Invite members using their @username!`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not create Hub.');
    } finally {
      setCreating(false);
    }
  };

  if (!firebaseUser) {
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
        {/* User Handle Banner */}
        <View style={styles.topBanner}>
          <View>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>Habit Hubs</Text>
            <Text style={[styles.bannerUser, { color: colors.accentGold }]}>
              Logged in as <Text style={{ fontWeight: '800' }}>@{user?.username || 'user'}</Text>
            </Text>
          </View>
          <Button
            title="+ Create Hub"
            size="small"
            variant="primary"
            onPress={() => setModalVisible(true)}
          />
        </View>

        {/* Pending Invites Section */}
        {pendingInvites.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.accentGold }]}>
              Pending Invites ({pendingInvites.length})
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
              Create a group circle to track habits with friends, family, or study partners, or ask a friend to invite you by your username <Text style={{ color: colors.primary, fontWeight: '800' }}>@{user?.username}</Text>.
            </Text>
            <Button
              title="+ Create First Habit Hub"
              variant="primary"
              onPress={() => setModalVisible(true)}
              style={{ marginTop: 16 }}
            />
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
