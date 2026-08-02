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

export class AuthService {
  // Format username (lower-case, allow letters, numbers, underscores)
  static formatUsername(input: string): string {
    return input.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  // Check if username is valid and available in Firestore
  static async checkUsernameAvailable(rawUsername: string): Promise<boolean> {
    const formatted = this.formatUsername(rawUsername);
    if (!formatted || formatted.length < 2) return false;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', formatted));
    const snap = await getDocs(q);
    return snap.empty;
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

    // Fallback if needed
    while (suggestions.length < 3) {
      const fallback = `${base}_${Math.floor(100 + Math.random() * 900)}`;
      if (!suggestions.includes(fallback)) {
        suggestions.push(fallback);
      }
    }

    return suggestions;
  }

  // Sign up user with email, password, username & displayName
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

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const firebaseUser = cred.user;

    // Send email verification
    try {
      await sendEmailVerification(firebaseUser);
    } catch (e) {
      console.warn('Could not send email verification:', e);
    }

    // Update Auth Profile
    await updateProfile(firebaseUser, { displayName });

    const userProfile: UserProfileData = {
      uid: firebaseUser.uid,
      username,
      email: email.trim(),
      displayName,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
    };

    // Save User Document to Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

    return userProfile;
  }

  // Sign in with Email & Password
  static async signInUser(email: string, pass: string): Promise<UserProfileData> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const firebaseUser = cred.user;

    // Fetch User Profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfileData;
      // Sync emailVerified status
      if (data.emailVerified !== firebaseUser.emailVerified) {
        data.emailVerified = firebaseUser.emailVerified;
        await setDoc(doc(db, 'users', firebaseUser.uid), { emailVerified: firebaseUser.emailVerified }, { merge: true });
      }
      return data;
    }

    // Fallback profile if Firestore doc missing
    return {
      uid: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || 'user',
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
    };
  }

  // Fetch Profile by UID
  static async getUserProfile(uid: string): Promise<UserProfileData | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as UserProfileData) : null;
  }

  // Fetch Profile by Username
  static async getUserByUsername(rawUsername: string): Promise<UserProfileData | null> {
    const username = this.formatUsername(rawUsername);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfileData;
    }
    return null;
  }

  // Resend Email Verification
  static async resendVerificationEmail(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  // Sign Out
  static async signOutUser(): Promise<void> {
    await signOut(auth);
  }
}
