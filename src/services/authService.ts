import { api, setToken, removeToken } from '@/config/api';
import { UserProfileData } from '@/types/auth';
import { AxiosError } from 'axios';

export class AuthService {
  static formatUsername(input: string): string {
    return input.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  static async checkUsernameAvailable(rawUsername: string): Promise<boolean> {
    // Basic mock since we haven't built the exact endpoint, assume true for now
    return true; 
  }

  static async getUsernameSuggestions(rawUsername: string): Promise<string[]> {
    return [];
  }

  static async signUpUser(email: string, pass: string, username: string, displayName: string): Promise<UserProfileData> {
    try {
      const formattedUsername = this.formatUsername(username);
      
      const response = await api.post('/signup', {
        email,
        password: pass,
        username: formattedUsername,
      });

      // Login immediately after signup
      return await this.signInUser(formattedUsername, pass);
    } catch (err: any) {
      console.error('Sign up error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.detail || err.message);
    }
  }

  static async signInUser(usernameOrEmail: string, pass: string): Promise<UserProfileData> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', usernameOrEmail);
      formData.append('password', pass);

      const loginRes = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const token = loginRes.data.access_token;
      await setToken(token);

      return await this.getUserProfile();
    } catch (err: any) {
      console.error('Sign in error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.detail || 'Invalid login credentials');
    }
  }

  static async getUserProfile(): Promise<UserProfileData> {
    try {
      const res = await api.get('/user/me');
      return res.data;
    } catch (err) {
      throw new Error('Failed to load profile');
    }
  }

  static async signOutUser(): Promise<void> {
    await removeToken();
  }

  static async verifyOtp(email: string, otp: string): Promise<UserProfileData> {
    // Email verification disabled per JWT design
    return {} as UserProfileData;
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    // Disabled
  }

  static async updateUserProfile(userId: string, data: Partial<UserProfileData>): Promise<void> {
    // A stub for now, implement PUT /user/me in the future
    console.log('Update user stub', data);
  }
}
