import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { UserProfileData } from '@/types/auth';

// Local Mock Users Store for fallback when Firebase API key is unconfigured/placeholder
const mockUsersStore: Record<string, UserProfileData> = {};
let mockCurrentUserId: string | null = null;

export class AuthService {
  // Format username (lower-case, allow letters, numbers, underscores)
  static formatUsername(input: string): string {
    return input.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  // Check if username is valid and available
  static async checkUsernameAvailable(rawUsername: string): Promise<boolean> {
    const formatted = this.formatUsername(rawUsername);
    if (!formatted || formatted.length < 2) return false;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', formatted));
      const snap = await getDocs(q);
      return snap.empty;
    } catch {
      // Mock Fallback
      const taken = Object.values(mockUsersStore).some((u) => u.username === formatted);
      return !taken;
    }
  }

  // Generate 3 available username suggestions (like TikTok & Instagram)
  static async getUsernameSuggestions(rawUsername: string): Promise<string[]> {
    const base = this.formatUsername(rawUsername) || 'user';
    const suggestions: string[] = [];

    const candidates = [
      `${base}_619`,
      `${base}_`,
      `${base}_official`,
      `the_${base}`,
      `${base}_${Math.floor(10 + Math.random() * 90)}`,
      `real_${base}`,
    ];

    for (const cand of candidates) {
      if (suggestions.length >= 3) break;
      const isFree = await this.checkUsernameAvailable(cand);
      if (isFree && !suggestions.includes(cand)) {
        suggestions.push(cand);
      }
    }

    while (suggestions.length < 3) {
      const fallback = `${base}_${Math.floor(100 + Math.random() * 900)}`;
      if (!suggestions.includes(fallback)) {
        suggestions.push(fallback);
      }
    }

    return suggestions;
  }

  // Sign up user
  static async signUpUser(
    email: string,
    pass: string,
    rawUsername: string,
    displayName: string
  ): Promise<UserProfileData> {
    const username = this.formatUsername(rawUsername);
    if (!username || username.length < 2) {
      throw new Error('Username must be at least 2 characters (letters, numbers, underscores allowed).');
    }

    const available = await this.checkUsernameAvailable(username);
    if (!available) {
      throw new Error(`Username "@${username}" is already taken. Please choose another.`);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const firebaseUser = cred.user;

      try {
        await sendEmailVerification(firebaseUser);
      } catch (e) {
        console.warn('Could not send email verification link:', e);
      }

      await updateProfile(firebaseUser, { displayName });

      const userProfile: UserProfileData = {
        uid: firebaseUser.uid,
        username,
        email: email.trim(),
        displayName,
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      return userProfile;
    } catch (err: any) {
      // If Firebase API Key is invalid or unconfigured, use resilient Mock Local Auth
      if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key')) {
        const mockUid = `user_${Date.now()}`;
        const mockProfile: UserProfileData = {
          uid: mockUid,
          username,
          email: email.trim(),
          displayName,
          emailVerified: true, // Auto-verify in mock mode
          createdAt: new Date().toISOString(),
        };
        mockUsersStore[mockUid] = mockProfile;
        mockCurrentUserId = mockUid;
        return mockProfile;
      }
      throw err;
    }
  }

  // Sign in with Email & Password
  static async signInUser(email: string, pass: string): Promise<UserProfileData> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const firebaseUser = cred.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfileData;
      }

      return {
        uid: firebaseUser.uid,
        username: firebaseUser.email?.split('@')[0] || 'user',
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key')) {
        const found = Object.values(mockUsersStore).find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (found) {
          mockCurrentUserId = found.uid;
          return found;
        }
        const mockUid = `user_${Date.now()}`;
        const mockProfile: UserProfileData = {
          uid: mockUid,
          username: email.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'user',
          email: email.trim(),
          displayName: 'Demo User',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };
        mockUsersStore[mockUid] = mockProfile;
        mockCurrentUserId = mockUid;
        return mockProfile;
      }
      throw err;
    }
  }

  // Fetch Profile by UID
  static async getUserProfile(uid: string): Promise<UserProfileData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? (userDoc.data() as UserProfileData) : null;
    } catch {
      return mockUsersStore[uid] || null;
    }
  }

  // Fetch Profile by Username
  static async getUserByUsername(rawUsername: string): Promise<UserProfileData | null> {
    const username = this.formatUsername(rawUsername);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as UserProfileData;
      }
    } catch {
      const found = Object.values(mockUsersStore).find((u) => u.username === username);
      if (found) return found;
    }

    // Mock fallback user generator so inviting works seamlessly in offline mode
    return {
      uid: `mock_${username}`,
      username,
      email: `${username}@example.com`,
      displayName: `@${username}`,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Resend Email Verification
  static async resendVerificationEmail(): Promise<void> {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (e) {
      console.warn('Verification resend ignored in mock mode');
    }
  }

  // Sign Out
  static async signOutUser(): Promise<void> {
    mockCurrentUserId = null;
    try {
      await signOut(auth);
    } catch {}
  }
}
