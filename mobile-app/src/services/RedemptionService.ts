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

export interface Redemption {
  id: number;
  rewardName: string;
  creditCost: number;
  redeemedAt: string;
  status: 'active' | 'used' | 'expired';
  voucherCode?: string;
  expiryDate?: string;
  partnerName?: string;
  description?: string;
}

export interface RedemptionsResponse {
  success: boolean;
  redemptions: Redemption[];
  total?: number;
  error?: string;
}

export interface VouchersResponse {
  success: boolean;
  vouchers: Redemption[];
  total?: number;
  error?: string;
}

export const getRedemptionHistory = async (): Promise<RedemptionsResponse> => {
  try {
    const response = await apiClient.get('/redemptions/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching redemption history:', error);
    return {
      success: false,
      redemptions: [],
      error: 'Failed to fetch redemption history',
    };
  }
};

export const getActiveVouchers = async (): Promise<VouchersResponse> => {
  try {
    const response = await apiClient.get('/redemptions/vouchers');
    return response.data;
  } catch (error) {
    console.error('Error fetching active vouchers:', error);
    return {
      success: false,
      vouchers: [],
      error: 'Failed to fetch active vouchers',
    };
  }
};

export const getRedemptionDetails = async (redemptionId: number): Promise<RedemptionsResponse> => {
  try {
    const response = await apiClient.get(`/redemptions/${redemptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching redemption details:', error);
    return {
      success: false,
      redemptions: [],
      error: 'Failed to fetch redemption details',
    };
  }
};

export const validateVoucherCode = async (voucherCode: string): Promise<{ success: boolean; voucher?: Redemption; error?: string }> => {
  try {
    const response = await apiClient.post('/redemptions/validate', {
      voucherCode,
    });
    return response.data;
  } catch (error) {
    console.error('Error validating voucher code:', error);
    return {
      success: false,
      error: 'Failed to validate voucher code',
    };
  }
};

export const useVoucher = async (voucherCode: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post('/redemptions/use', {
      voucherCode,
    });
    return response.data;
  } catch (error) {
    console.error('Error using voucher:', error);
    return {
      success: false,
      error: 'Failed to use voucher',
    };
  }
};

export const getExpiringVouchers = async (daysAhead: number = 7): Promise<VouchersResponse> => {
  try {
    const response = await apiClient.get(`/redemptions/expiring?daysAhead=${daysAhead}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expiring vouchers:', error);
    return {
      success: false,
      vouchers: [],
      error: 'Failed to fetch expiring vouchers',
    };
  }
};

export const getRedemptionStats = async (): Promise<{ success: boolean; stats: any; error?: string }> => {
  try {
    const response = await apiClient.get('/redemptions/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching redemption stats:', error);
    return {
      success: false,
      stats: {},
      error: 'Failed to fetch redemption stats',
    };
  }
}; 