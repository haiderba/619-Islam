export type MemberRole = 'owner' | 'member';
export type MemberStatus = 'pending' | 'accepted' | 'declined';

export interface HabitHub {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
  memberCount?: number;
}

export interface HubMember {
  id: string; // `${hubId}_${userId}`
  hubId: string;
  userId: string;
  username: string;
  displayName: string;
  role: MemberRole;
  status: MemberStatus;
  invitedAt: string;
  joinedAt?: string | null;
}

export interface HubGoal {
  id: string;
  hubId: string;
  title: string;
  description?: string;
  category: string;
  createdBy: string;
  createdAt: string;
  isGroupCompletedToday?: boolean;
}

export interface HubGoalCompletion {
  id: string; // `${hubGoalId}_${userId}_${date}`
  hubId: string;
  hubGoalId: string;
  userId: string;
  username: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: string;
}
