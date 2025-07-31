import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { DEFAULT_API_CONFIG } from '../config/api';

const API_BASE_URL = DEFAULT_API_CONFIG.BASE_URL;

// Configure axios with auth token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
  category?: string;
  creditReward?: number;
}

export interface AchievementsResponse {
  success: boolean;
  achievements: Achievement[];
  total?: number;
  error?: string;
}

export const getAchievements = async (): Promise<AchievementsResponse> => {
  try {
    const response = await apiClient.get('/achievements');
    return response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return {
      success: false,
      achievements: [],
      error: 'Failed to fetch achievements',
    };
  }
};

export const getAchievementById = async (achievementId: number): Promise<AchievementsResponse> => {
  try {
    const response = await apiClient.get(`/achievements/${achievementId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching achievement details:', error);
    return {
      success: false,
      achievements: [],
      error: 'Failed to fetch achievement details',
    };
  }
};

export const getUnlockedAchievements = async (): Promise<AchievementsResponse> => {
  try {
    const response = await apiClient.get('/achievements?unlocked=true');
    return response.data;
  } catch (error) {
    console.error('Error fetching unlocked achievements:', error);
    return {
      success: false,
      achievements: [],
      error: 'Failed to fetch unlocked achievements',
    };
  }
};

export const getAchievementProgress = async (): Promise<{ success: boolean; progress: any[]; error?: string }> => {
  try {
    const response = await apiClient.get('/achievements/progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching achievement progress:', error);
    return {
      success: false,
      progress: [],
      error: 'Failed to fetch achievement progress',
    };
  }
}; 