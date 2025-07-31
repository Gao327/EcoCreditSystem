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

export interface Reward {
  id: number;
  name: string;
  description: string;
  creditCost: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  partnerName?: string;
  expiryDate?: string;
}

export interface RewardsResponse {
  success: boolean;
  rewards: Reward[];
  total?: number;
  error?: string;
}

export interface RedeemResponse {
  success: boolean;
  data?: {
    balance: number;
    redemptionId: number;
  };
  error?: string;
}

export const getRewards = async (category?: string, search?: string): Promise<RewardsResponse> => {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') {
      params.append('category', category);
    }
    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get(`/rewards?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return {
      success: false,
      rewards: [],
      error: 'Failed to fetch rewards',
    };
  }
};

export const getFeaturedRewards = async (): Promise<RewardsResponse> => {
  try {
    const response = await apiClient.get('/rewards/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured rewards:', error);
    return {
      success: false,
      rewards: [],
      error: 'Failed to fetch featured rewards',
    };
  }
};

export const getRewardById = async (rewardId: number): Promise<RewardsResponse> => {
  try {
    const response = await apiClient.get(`/rewards/${rewardId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reward details:', error);
    return {
      success: false,
      rewards: [],
      error: 'Failed to fetch reward details',
    };
  }
};

export const redeemReward = async (rewardId: number): Promise<RedeemResponse> => {
  try {
    const response = await apiClient.post(`/rewards/${rewardId}/redeem`);
    return response.data;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return {
      success: false,
      error: 'Failed to redeem reward',
    };
  }
};

export const getRewardCategories = async (): Promise<{ success: boolean; categories: string[]; error?: string }> => {
  try {
    const response = await apiClient.get('/rewards/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching reward categories:', error);
    return {
      success: false,
      categories: [],
      error: 'Failed to fetch categories',
    };
  }
}; 