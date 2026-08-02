import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import { AuthService } from '@/services/authService';
import { UserProfileData } from '@/types/auth';

interface AuthContextType {
  user: UserProfileData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfileData>;
  signUp: (email: string, pass: string, username: string, displayName: string) => Promise<UserProfileData>;
  signOut: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  emailVerified: false,
  signIn: async () => ({} as UserProfileData),
  signUp: async () => ({} as UserProfileData),
  signOut: async () => {},
  resendVerification: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const profile = await AuthService.getUserProfile(auth.currentUser.uid);
      setUser(profile);
      setFirebaseUser(auth.currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await AuthService.getUserProfile(fbUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await AuthService.signInUser(email, pass);
      setUser(profile);
      if (auth.currentUser) {
        setFirebaseUser(auth.currentUser);
      }
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, username: string, displayName: string) => {
    setLoading(true);
    try {
      const profile = await AuthService.signUpUser(email, pass, username, displayName);
      setUser(profile);
      if (auth.currentUser) {
        setFirebaseUser(auth.currentUser);
      }
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await AuthService.signOutUser();
    setUser(null);
    setFirebaseUser(null);
  };

  const resendVerification = async () => {
    await AuthService.resendVerificationEmail();
  };

  const emailVerified = firebaseUser ? firebaseUser.emailVerified : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        emailVerified,
        signIn,
        signUp,
        signOut: signOutUser,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
