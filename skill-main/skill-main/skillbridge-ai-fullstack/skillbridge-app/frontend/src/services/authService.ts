import api from './api';
import type { User } from '@/types';

export const authService = {
  async loginWithGoogle(idToken: string): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/auth/google', { id_token: idToken });
    return data;
  },
  async sendOtp(phone: string): Promise<{ sent: boolean }> {
    const { data } = await api.post('/auth/send-otp', { phone });
    return data;
  },
  async verifyOtp(phone: string, otp: string): Promise<{ user: User; token: string }> {
    const { data } = await api.post('/auth/verify-otp', { phone, otp });
    return data;
  },
  async me(): Promise<User> {
    const { data } = await api.get('/users/me');
    return data;
  },
  logout() {
    localStorage.removeItem('sb_token');
  },
};
