import { create } from 'zustand';
import api from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('cw-token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('cw-token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      const { token, user } = res.data;
      localStorage.setItem('cw-token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Signup failed',
        isLoading: false,
      });
      throw err;
    }
  },

  googleLogin: async (credential: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/google-login', { credential });
      const { token, user } = res.data;
      localStorage.setItem('cw-token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Google login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to send reset email',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('cw-token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('cw-token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('cw-token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
