import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { AuthService } from './authService';
import { HabitHub, HubMember, HubGoal, HubGoalCompletion } from '@/types/hub';
import { getTodayDateString } from '@/utils/dateUtils';

// Local Persistent Store for Hubs when offline
const mockHubsStore: Record<string, HabitHub> = {};
const mockMembersStore: Record<string, HubMember[]> = {};
const mockGoalsStore: Record<string, HubGoal[]> = {};
const mockCompletionsStore: Record<string, HubGoalCompletion[]> = {};

export class HubService {
  // Create a new Habit Hub
  static async createHub(name: string, description: string = ''): Promise<HabitHub> {
    const user = auth.currentUser;
    const uid = user ? user.uid : 'demo_user';

    const userProfile = await AuthService.getUserProfile(uid);
    const ownerUsername = userProfile?.username || user?.email?.split('@')[0] || 'owner';
    const ownerDisplayName = userProfile?.displayName || user?.displayName || 'Owner';

    const hubId = `hub_${Date.now()}`;
    const hubData: HabitHub = {
      id: hubId,
      name: name.trim(),
      description: description.trim(),
      ownerId: uid,
      ownerUsername,
      memberUserIds: [uid],
      pendingUserIds: [],
      createdAt: new Date().toISOString(),
    };

    const ownerMember: HubMember = {
      id: `${hubId}_${uid}`,
      hubId,
      userId: uid,
      username: ownerUsername,
      displayName: ownerDisplayName,
      role: 'owner',
      status: 'accepted',
      invitedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    };

    // Store in local store immediately
    mockHubsStore[hubId] = hubData;
    mockMembersStore[hubId] = [ownerMember];

    try {
      const hubRef = doc(db, 'hubs', hubId);
      await setDoc(hubRef, hubData);

      const memberRef = doc(db, 'hubs', hubId, 'members', uid);
      await setDoc(memberRef, ownerMember);
    } catch (e) {
      console.warn('Firestore setDoc note:', e);
    }

    return hubData;
  }

  // Invite member by @username
  static async inviteMemberByUsername(hubId: string, rawUsername: string): Promise<HubMember> {
    const targetUser = await AuthService.getUserByUsername(rawUsername);
    if (!targetUser) {
      throw new Error(`User "@${rawUsername}" not found. Please check the username.`);
    }

    const memberData: HubMember = {
      id: `${hubId}_${targetUser.uid}`,
      hubId,
      userId: targetUser.uid,
      username: targetUser.username,
      displayName: targetUser.displayName,
      role: 'member',
      status: 'pending',
      invitedAt: new Date().toISOString(),
      joinedAt: null,
    };

    try {
      const existingMemberRef = doc(db, 'hubs', hubId, 'members', targetUser.uid);
      await setDoc(existingMemberRef, memberData);

      const hubRef = doc(db, 'hubs', hubId);
      await updateDoc(hubRef, {
        pendingUserIds: arrayUnion(targetUser.uid),
      });
    } catch {
      if (!mockMembersStore[hubId]) mockMembersStore[hubId] = [];
      mockMembersStore[hubId].push(memberData);
    }

    return memberData;
  }

  // Respond to Pending Hub Invite (Accept / Decline)
  static async respondToInvite(hubId: string, accept: boolean): Promise<void> {
    const user = auth.currentUser;
    const uid = user ? user.uid : 'demo_user';

    try {
      const memberRef = doc(db, 'hubs', hubId, 'members', uid);
      const hubRef = doc(db, 'hubs', hubId);

      if (accept) {
        await updateDoc(memberRef, { status: 'accepted', joinedAt: new Date().toISOString() });
        await updateDoc(hubRef, {
          memberUserIds: arrayUnion(uid),
          pendingUserIds: arrayRemove(uid),
        });
      } else {
        await deleteDoc(memberRef);
        await updateDoc(hubRef, {
          pendingUserIds: arrayRemove(uid),
        });
      }
    } catch {
      if (mockMembersStore[hubId]) {
        if (accept) {
          const idx = mockMembersStore[hubId].findIndex((m) => m.userId === uid);
          if (idx >= 0) {
            mockMembersStore[hubId][idx].status = 'accepted';
            mockMembersStore[hubId][idx].joinedAt = new Date().toISOString();
          }
        } else {
          mockMembersStore[hubId] = mockMembersStore[hubId].filter((m) => m.userId !== uid);
        }
      }
    }
  }

  // Create a Group Habit/Goal in Hub
  static async createHubGoal(
    hubId: string,
    title: string,
    description: string = '',
    category: string = 'General'
  ): Promise<HubGoal> {
    const user = auth.currentUser;
    const uid = user ? user.uid : 'demo_user';

    const goalId = `goal_${Date.now()}`;
    const goalData: HubGoal = {
      id: goalId,
      hubId,
      title: title.trim(),
      description: description.trim(),
      category,
      createdBy: uid,
      createdAt: new Date().toISOString(),
    };

    try {
      const goalRef = doc(db, 'hubs', hubId, 'goals', goalId);
      await setDoc(goalRef, goalData);
    } catch {
      if (!mockGoalsStore[hubId]) mockGoalsStore[hubId] = [];
      mockGoalsStore[hubId].push(goalData);
    }

    return goalData;
  }

  // Toggle member's completion of a Hub goal for today
  static async toggleMemberCompletion(
    hubId: string,
    hubGoalId: string,
    date: string = getTodayDateString()
  ): Promise<boolean> {
    const user = auth.currentUser;
    const uid = user ? user.uid : 'demo_user';
    const userProfile = await AuthService.getUserProfile(uid);
    const username = userProfile?.username || 'member';

    const completionId = `${hubGoalId}_${uid}_${date}`;
    let isCompletedNow = true;

    try {
      const compRef = doc(db, 'hubs', hubId, 'completions', completionId);
      const compSnap = await getDoc(compRef);

      if (compSnap.exists() && compSnap.data()?.completed) {
        isCompletedNow = false;
        await updateDoc(compRef, { completed: false });
      } else {
        const record: HubGoalCompletion = {
          id: completionId,
          hubId,
          hubGoalId,
          userId: uid,
          username,
          date,
          completed: true,
          completedAt: new Date().toISOString(),
        };
        await setDoc(compRef, record);
      }
    } catch {
      if (!mockCompletionsStore[hubId]) mockCompletionsStore[hubId] = [];
      const idx = mockCompletionsStore[hubId].findIndex((c) => c.id === completionId);
      if (idx >= 0) {
        mockCompletionsStore[hubId][idx].completed = !mockCompletionsStore[hubId][idx].completed;
        isCompletedNow = mockCompletionsStore[hubId][idx].completed;
      } else {
        mockCompletionsStore[hubId].push({
          id: completionId,
          hubId,
          hubGoalId,
          userId: uid,
          username,
          date,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }
    }

    return isCompletedNow;
  }

  // Real-time listener for user's hubs and pending invites (backward-compatible)
  static listenToUserHubs(
    userId: string,
    onData: (hubs: HabitHub[], invites: { hub: HabitHub; member: HubMember }[]) => void
  ) {
    try {
      const hubsRef = collection(db, 'hubs');

      return onSnapshot(
        hubsRef,
        (hubsSnap) => {
          const allRemoteHubs: HabitHub[] = hubsSnap.docs.map((d) => d.data() as HabitHub);
          const activeHubs: HabitHub[] = [];
          const pendingInvites: { hub: HabitHub; member: HubMember }[] = [];

          for (const hub of allRemoteHubs) {
            const isOwner = hub.ownerId === userId;
            const isMember = hub.memberUserIds && hub.memberUserIds.includes(userId);
            const isPending = hub.pendingUserIds && hub.pendingUserIds.includes(userId);

            if (isOwner || isMember) {
              activeHubs.push(hub);
            } else if (isPending) {
              pendingInvites.push({
                hub,
                member: {
                  id: `${hub.id}_${userId}`,
                  hubId: hub.id,
                  userId,
                  username: '',
                  displayName: '',
                  role: 'member',
                  status: 'pending',
                  invitedAt: hub.createdAt,
                },
              });
            }
          }

          // Combine with local mock hubs
          const mockList = Object.values(mockHubsStore).filter(
            (h) => h.ownerId === userId || (h.memberUserIds && h.memberUserIds.includes(userId))
          );
          for (const mHub of mockList) {
            if (!activeHubs.some((h) => h.id === mHub.id)) {
              activeHubs.push(mHub);
            }
          }

          onData(activeHubs, pendingInvites);
        },
        (err) => {
          console.warn('Firestore snapshot warning:', err);
          const mockList = Object.values(mockHubsStore);
          onData(mockList, []);
        }
      );
    } catch {
      const mockList = Object.values(mockHubsStore);
      onData(mockList, []);
      return () => {};
    }
  }

  // Real-time listener for Hub details, members, goals, and completions
  static listenToHubDetails(
    hubId: string,
    date: string = getTodayDateString(),
    onData: (data: {
      hub: HabitHub | null;
      members: HubMember[];
      goals: HubGoal[];
      completions: HubGoalCompletion[];
    }) => void
  ) {
    try {
      const hubRef = doc(db, 'hubs', hubId);
      const membersRef = collection(db, 'hubs', hubId, 'members');
      const goalsRef = collection(db, 'hubs', hubId, 'goals');
      const completionsRef = collection(db, 'hubs', hubId, 'completions');

      return onSnapshot(hubRef, (hubSnap) => {
        if (!hubSnap.exists()) {
          const mockH = mockHubsStore[hubId] || null;
          onData({
            hub: mockH,
            members: mockMembersStore[hubId] || [],
            goals: mockGoalsStore[hubId] || [],
            completions: mockCompletionsStore[hubId] || [],
          });
          return;
        }
        const hub = hubSnap.data() as HabitHub;

        onSnapshot(membersRef, (membersSnap) => {
          const members = membersSnap.docs.map((d) => d.data() as HubMember);

          onSnapshot(goalsRef, (goalsSnap) => {
            const goals = goalsSnap.docs.map((d) => d.data() as HubGoal);

            onSnapshot(completionsRef, (compSnap) => {
              const completions = compSnap.docs
                .map((d) => d.data() as HubGoalCompletion)
                .filter((c) => c.date === date);

              onData({ hub, members, goals, completions });
            });
          });
        });
      });
    } catch {
      onData({
        hub: mockHubsStore[hubId] || null,
        members: mockMembersStore[hubId] || [],
        goals: mockGoalsStore[hubId] || [],
        completions: mockCompletionsStore[hubId] || [],
      });
      return () => {};
    }
  }
}
