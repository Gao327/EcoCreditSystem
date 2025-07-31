import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { DEFAULT_API_CONFIG } from '../config/api';

const API_BASE_URL = DEFAULT_API_CONFIG.BASE_URL;

// Configure axios with auth token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  username: string;
  email: string;
  isGuest: boolean;
  lastLogin: string;
  credits?: {
    availableCredits: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export const guestLogin = async (): Promise<AuthResponse> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId') || 
      Math.random().toString(36).substring(2, 15);
    
    await SecureStore.setItemAsync('deviceId', deviceId);
    
    const response = await apiClient.post('/auth/guest', {
      deviceId,
    });
    
    if (response.data.success && response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error with guest login:', error);
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        success: false,
        error: 'Network error - please check your connection and ensure the backend is running',
      };
    }
    return {
      success: false,
      error: 'Failed to login as guest',
    };
  }
};

export const googleSignIn = async (): Promise<AuthResponse> => {
  try {
    // For now, we'll simulate Google sign in
    // In a real app, you'd integrate with Google OAuth
    const response = await apiClient.post('/auth/google', {
      idToken: 'mock-google-token',
    });
    
    if (response.data.success && response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error with Google sign in:', error);
    return {
      success: false,
      error: 'Failed to login with Google',
    };
  }
};

export const getProfile = async (): Promise<AuthResponse> => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      error: 'Failed to fetch profile',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}; 