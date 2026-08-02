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
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { AuthService } from './authService';
import { HabitHub, HubMember, HubGoal, HubGoalCompletion } from '@/types/hub';
import { getTodayDateString } from '@/utils/dateUtils';

export class HubService {
  // Create a new Habit Hub
  static async createHub(name: string, description: string = ''): Promise<HabitHub> {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to create a Habit Hub.');

    const userProfile = await AuthService.getUserProfile(user.uid);
    const ownerUsername = userProfile?.username || user.email?.split('@')[0] || 'owner';
    const ownerDisplayName = userProfile?.displayName || user.displayName || 'Owner';

    const hubRef = doc(collection(db, 'hubs'));
    const hubId = hubRef.id;

    const hubData: HabitHub = {
      id: hubId,
      name: name.trim(),
      description: description.trim(),
      ownerId: user.uid,
      ownerUsername,
      createdAt: new Date().toISOString(),
    };

    await setDoc(hubRef, hubData);

    // Add Creator as Owner Member in hubMembers
    const memberRef = doc(db, 'hubs', hubId, 'members', user.uid);
    const ownerMember: HubMember = {
      id: `${hubId}_${user.uid}`,
      hubId,
      userId: user.uid,
      username: ownerUsername,
      displayName: ownerDisplayName,
      role: 'owner',
      status: 'accepted',
      invitedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    };

    await setDoc(memberRef, ownerMember);
    return hubData;
  }

  // Invite member by @username
  static async inviteMemberByUsername(hubId: string, rawUsername: string): Promise<HubMember> {
    const targetUser = await AuthService.getUserByUsername(rawUsername);
    if (!targetUser) {
      throw new Error(`User "@${rawUsername}" not found. Please check the username.`);
    }

    const existingMemberRef = doc(db, 'hubs', hubId, 'members', targetUser.uid);
    const existingSnap = await getDoc(existingMemberRef);
    if (existingSnap.exists()) {
      throw new Error(`User "@${targetUser.username}" is already in this Hub or has a pending invite.`);
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

    await setDoc(existingMemberRef, memberData);
    return memberData;
  }

  // Respond to Pending Hub Invite (Accept / Decline)
  static async respondToInvite(hubId: string, accept: boolean): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in.');

    const memberRef = doc(db, 'hubs', hubId, 'members', user.uid);
    if (accept) {
      await updateDoc(memberRef, {
        status: 'accepted',
        joinedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(memberRef);
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
    if (!user) throw new Error('Not logged in.');

    const goalRef = doc(collection(db, 'hubs', hubId, 'goals'));
    const goalData: HubGoal = {
      id: goalRef.id,
      hubId,
      title: title.trim(),
      description: description.trim(),
      category,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    };

    await setDoc(goalRef, goalData);
    return goalData;
  }

  // Toggle member's completion of a Hub goal for today
  static async toggleMemberCompletion(
    hubId: string,
    hubGoalId: string,
    date: string = getTodayDateString()
  ): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in.');

    const userProfile = await AuthService.getUserProfile(user.uid);
    const username = userProfile?.username || 'member';

    const completionId = `${hubGoalId}_${user.uid}_${date}`;
    const compRef = doc(db, 'hubs', hubId, 'completions', completionId);
    const compSnap = await getDoc(compRef);

    let isCompletedNow = true;

    if (compSnap.exists() && compSnap.data()?.completed) {
      isCompletedNow = false;
      await updateDoc(compRef, { completed: false });
    } else {
      const record: HubGoalCompletion = {
        id: completionId,
        hubId,
        hubGoalId,
        userId: user.uid,
        username,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      await setDoc(compRef, record);
    }

    return isCompletedNow;
  }

  // Real-time listener for user's hubs and pending invites
  static listenToUserHubs(
    userId: string,
    onData: (hubs: HabitHub[], invites: { hub: HabitHub; member: HubMember }[]) => void
  ) {
    // Listen across all hub members collection group or individual hubs
    // For fast real-time Firestore sync:
    const hubsRef = collection(db, 'hubs');

    return onSnapshot(hubsRef, async (hubsSnap) => {
      const activeHubs: HabitHub[] = [];
      const pendingInvites: { hub: HabitHub; member: HubMember }[] = [];

      for (const hubDoc of hubsSnap.docs) {
        const hub = hubDoc.data() as HabitHub;
        const memberRef = doc(db, 'hubs', hub.id, 'members', userId);
        const memberSnap = await getDoc(memberRef);

        if (memberSnap.exists()) {
          const member = memberSnap.data() as HubMember;
          if (member.status === 'accepted') {
            activeHubs.push(hub);
          } else if (member.status === 'pending') {
            pendingInvites.push({ hub, member });
          }
        }
      }

      onData(activeHubs, pendingInvites);
    });
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
    const hubRef = doc(db, 'hubs', hubId);
    const membersRef = collection(db, 'hubs', hubId, 'members');
    const goalsRef = collection(db, 'hubs', hubId, 'goals');
    const completionsRef = collection(db, 'hubs', hubId, 'completions');

    return onSnapshot(hubRef, (hubSnap) => {
      if (!hubSnap.exists()) return;
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
  }
}
