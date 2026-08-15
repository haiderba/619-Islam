export interface UserProfileData {
  uid: string;
  username: string; // Unique username e.g. @usman619
  email: string;
  displayName: string;
  emailVerified: boolean;
  photoURL?: string;
  lastUsernameUpdateAt?: string;
  role?: 'user' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: UserProfileData | null;
  firebaseUser: any | null;
  loading: boolean;
  emailVerified: boolean;
}
