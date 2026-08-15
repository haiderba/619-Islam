import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { UserProfileData } from '@/types/auth';
import { api, getToken } from '@/config/api';
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';

interface AuthContextType {
  user: UserProfileData | null;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfileData>;
  signUp: (email: string, pass: string, username: string, displayName: string) => Promise<UserProfileData>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<UserProfileData>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  emailVerified: false,
  signIn: async () => ({} as UserProfileData),
  signUp: async () => ({} as UserProfileData),
  signOut: async () => {},
  resendVerification: async () => {},
  verifyOtp: async () => ({} as UserProfileData),
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if logged in on mount
    AuthService.getUserProfile()
      .then(profile => {
        if (profile) {
          setUser(profile);
          registerForPushNotificationsAsync(profile.id.toString());
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await AuthService.getUserProfile();
        setUser(profile);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await AuthService.signInUser(email, pass);
      setUser(profile);
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
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await AuthService.signOutUser();
    setUser(null);
  };

  const verifyOtp = async (email: string, otp: string) => {
    return {} as UserProfileData;
  };

  const resendVerification = async (email: string) => {
  };

  const emailVerified = true; // Email verification skipped for now

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerified,
        signIn,
        signUp,
        signOut: signOutUser,
        resendVerification,
        verifyOtp,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
