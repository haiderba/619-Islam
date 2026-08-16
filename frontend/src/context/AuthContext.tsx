import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, SignupResult } from '../services/authService';
import { StorageService } from '../services/storageService';
import type { UserProfileData } from '../types/auth';

interface AuthContextType {
  user: UserProfileData | null;
  session: { user: UserProfileData } | null;
  loading: boolean;
  signIn: (username: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, username: string, name?: string, fiqh?: string) => Promise<SignupResult>;
  verifyOtp: (email: string, otpCode: string) => Promise<UserProfileData>;
  resendOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (profile: UserProfileData) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => ({ status: '', email: '', username: '', message: '' }),
  verifyOtp: async () => ({} as UserProfileData),
  resendOtp: async () => {},
  signOut: async () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety watchdog: ensure loading never hangs past 2 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const initAuth = async () => {
      try {
        const storedUser = await StorageService.getAuthSession();
        if (storedUser) {
          // Immediately unblock app with cached user profile (0ms instant startup)
          setUser(storedUser);
          setLoading(false);
          clearTimeout(safetyTimer);

          // Asynchronously refresh user profile in background without blocking UI
          if (navigator.onLine) {
            AuthService.getUserProfile()
              .then(async (profile) => {
                if (profile) {
                  setUser(profile);
                  await StorageService.saveAuthSession(profile);
                }
              })
              .catch(async (networkErr: any) => {
                if (networkErr?.response?.status === 401) {
                  setUser(null);
                  await StorageService.clearAuthSession();
                }
              });
          }
        } else {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      } catch (error) {
        console.error('Auth initialization error', error);
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    };
    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const signIn = async (username: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await AuthService.signInUser(username, pass);
      setUser(profile);
      await StorageService.saveAuthSession(profile);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, username: string, name?: string, fiqh?: string): Promise<SignupResult> => {
    return await AuthService.signUpUser(email, pass, username, name, fiqh);
  };

  const verifyOtp = async (email: string, otpCode: string): Promise<UserProfileData> => {
    setLoading(true);
    try {
      const profile = await AuthService.verifyOtp(email, otpCode);
      setUser(profile);
      await StorageService.saveAuthSession(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    await AuthService.resendVerificationEmail(email);
  };

  const signOut = async () => {
    setLoading(true);
    await AuthService.signOutUser();
    setUser(null);
    await StorageService.clearAuthSession();
    setLoading(false);
  };

  const updateUser = (profile: UserProfileData) => {
    setUser(profile);
    StorageService.saveAuthSession(profile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session: user ? { user } : null,
      loading,
      signIn,
      signUp,
      verifyOtp,
      resendOtp,
      signOut,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
