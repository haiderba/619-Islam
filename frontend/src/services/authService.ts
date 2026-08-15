import { api, setToken, removeToken } from '@/config/api';
import type { UserProfileData } from '@/types/auth';

export interface SignupResult {
  status: string;
  email: string;
  username: string;
  message: string;
}

export class AuthService {
  static formatUsername(input: string): string {
    return input.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  static async checkUsernameAvailable(_rawUsername: string): Promise<boolean> {
    return true; 
  }

  static async getUsernameSuggestions(_rawUsername: string): Promise<string[]> {
    return [];
  }

  static async signUpUser(
    email: string, 
    pass: string, 
    username: string, 
    name?: string, 
    fiqh: string = "Sunni (Hanafi)"
  ): Promise<SignupResult> {
    try {
      const formattedUsername = this.formatUsername(username);
      
      const res = await api.post('/signup', {
        email: email.trim().toLowerCase(),
        password: pass,
        username: formattedUsername,
        name: name || formattedUsername,
        fiqh,
      });

      return res.data;
    } catch (err: any) {
      console.error('Sign up error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.detail || err.message || 'Signup failed');
    }
  }

  static async verifyOtp(email: string, otpCode: string): Promise<UserProfileData> {
    try {
      const res = await api.post('/verify-otp', {
        email: email.trim().toLowerCase(),
        otp_code: otpCode.trim()
      });

      const token = res.data.access_token;
      await setToken(token);
      return res.data.user;
    } catch (err: any) {
      console.error('OTP Verification error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.detail || 'Invalid or expired verification code');
    }
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      await api.post('/resend-otp', {
        email: email.trim().toLowerCase()
      });
    } catch (err: any) {
      console.error('Resend OTP error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.detail || 'Failed to resend code');
    }
  }

  static async signInUser(usernameOrEmail: string, pass: string): Promise<UserProfileData> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', usernameOrEmail.trim());
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

  static async updateUserProfile(_userId: string, data: Partial<UserProfileData>): Promise<void> {
    try {
      await api.put('/user/me', data);
    } catch (e) {
      console.error('Update user failed', e);
    }
  }
}
