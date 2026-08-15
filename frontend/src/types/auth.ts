export interface UserProfileData {
  id: number;
  username: string;
  email: string;
  name?: string;
  fiqh: string;
  language: string;
  focus_areas: string;
  onboarding_completed: boolean;
  quran_translation: string;
  latitude?: string;
  longitude?: string;
  created_at: string;
}

export interface AuthState {
  user: UserProfileData | null;
  firebaseUser: any | null;
  loading: boolean;
  emailVerified: boolean;
}
