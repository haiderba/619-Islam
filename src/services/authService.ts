import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
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
  // Format username (e.g. remove spaces, lower-case, strip leading @)
  static formatUsername(input: string): string {
    return input.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  // Check if username is already taken in Firestore
  static async checkUsernameAvailable(username: string): Promise<boolean> {
    const formatted = this.formatUsername(username);
    if (!formatted || formatted.length < 3) return false;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', formatted));
    const snap = await getDocs(q);
    return snap.empty;
  }

  // Sign up user with email, password, username & displayName
  static async signUpUser(
    email: string,
    pass: string,
    rawUsername: string,
    displayName: string
  ): Promise<UserProfileData> {
    const username = this.formatUsername(rawUsername);
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters (letters, numbers, underscores).');
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
