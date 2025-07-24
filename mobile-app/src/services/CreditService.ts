import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api'; // Change to your production URL

interface CreditBalance {
  userId: string;
  totalCredits: number;
  availableCredits: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastUpdated: Date;
}

interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  source: string;
  description: string;
  createdAt: Date;
}

interface ConversionResult {
  success: boolean;
  data?: {
    creditsEarned: number;
    baseCredits: number;
    bonusCredits: number;
    balance: CreditBalance;
    transaction: CreditTransaction;
  };
  error?: string;
}

class CreditService {
  private static instance: CreditService;

  private constructor() {}

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  private async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('userId') || 'demo_user';
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 'demo_user'; // Fallback for demo
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async createAuthHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async convertStepsToCredits(steps: number): Promise<ConversionResult> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return {
          success: false,
          error: 'User ID not available',
        };
      }

      const headers = await this.createAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/credits/convert-steps`,
        {
          userId,
          steps,
          date: new Date().toISOString(),
        },
        { headers }
      );

      if (response.data.success) {
        // Cache the latest balance
        await this.cacheBalance(response.data.data.balance);
        
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error?.message || 'Conversion failed',
      };
    } catch (error) {
      console.error('Error converting steps to credits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getUserBalance(): Promise<CreditBalance | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return null;
      }

      const headers = await this.createAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/credits/${userId}/balance`,
        { headers }
      );

      if (response.data.success) {
        const balance = response.data.data;
        await this.cacheBalance(balance);
        return balance;
      }

      return null;
    } catch (error) {
      console.error('Error getting user balance:', error);
      // Try to return cached balance
      return await this.getCachedBalance();
    }
  }

  async getCreditTransactions(
    limit: number = 20,
    offset: number = 0,
    type?: string
  ): Promise<{ transactions: CreditTransaction[]; total: number } | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return null;
      }

      const headers = await this.createAuthHeaders();
      const params: any = { limit, offset };
      if (type) params.type = type;

      const response = await axios.get(
        `${API_BASE_URL}/credits/${userId}/transactions`,
        { headers, params }
      );

      if (response.data.success) {
        return {
          transactions: response.data.data,
          total: response.data.metadata.total,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting credit transactions:', error);
      return null;
    }
  }

  async spendCredits(
    amount: number,
    description: string,
    rewardId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return {
          success: false,
          error: 'User ID not available',
        };
      }

      const headers = await this.createAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/credits/${userId}/spend`,
        {
          amount,
          description,
          rewardId,
        },
        { headers }
      );

      if (response.data.success) {
        // Update cached balance
        await this.cacheBalance(response.data.data.updatedBalance);
        return { success: true };
      }

      return {
        success: false,
        error: response.data.error?.message || 'Spending failed',
      };
    } catch (error) {
      console.error('Error spending credits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private async cacheBalance(balance: CreditBalance): Promise<void> {
    try {
      await SecureStore.setItemAsync('cachedBalance', JSON.stringify(balance));
      await SecureStore.setItemAsync('balanceCacheTime', new Date().toISOString());
    } catch (error) {
      console.error('Error caching balance:', error);
    }
  }

  private async getCachedBalance(): Promise<CreditBalance | null> {
    try {
      const cachedBalance = await SecureStore.getItemAsync('cachedBalance');
      const cacheTime = await SecureStore.getItemAsync('balanceCacheTime');

      if (cachedBalance && cacheTime) {
        const cacheAge = Date.now() - new Date(cacheTime).getTime();
        // Use cached balance if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          return JSON.parse(cachedBalance);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached balance:', error);
      return null;
    }
  }

  async estimateCreditsFromSteps(steps: number): Promise<number> {
    // Basic estimation: 1 credit per 100 steps
    let credits = Math.floor(steps * 0.01);
    
    // Add daily goal bonus estimation
    if (steps >= 10000) {
      credits += 50; // Daily goal bonus
    }

    return credits;
  }

  async getCreditEarningRates(): Promise<{
    stepsToCredits: number;
    dailyGoalBonus: number;
    weeklyGoalBonus: number;
    minStepsForCredits: number;
  }> {
    // These could be fetched from the server in a real implementation
    return {
      stepsToCredits: 0.01, // 1 credit per 100 steps
      dailyGoalBonus: 50,   // Bonus for 10,000+ steps
      weeklyGoalBonus: 200, // Weekly goal bonus
      minStepsForCredits: 1000, // Minimum steps to earn credits
    };
  }

  async getAvailableRewards(): Promise<any[]> {
    try {
      const headers = await this.createAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/rewards`, { headers });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  async redeemReward(rewardId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return {
          success: false,
          error: 'User ID not available',
        };
      }

      const headers = await this.createAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/rewards/redeem`,
        {
          userId,
          rewardId,
        },
        { headers }
      );

      if (response.data.success) {
        // Refresh balance after redemption
        await this.getUserBalance();
        
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data.error?.message || 'Redemption failed',
      };
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getUserRedemptions(): Promise<any[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return [];
      }

      const headers = await this.createAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/rewards/redemptions/${userId}`,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error getting user redemptions:', error);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('cachedBalance');
      await SecureStore.deleteItemAsync('balanceCacheTime');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Export singleton instance functions
const creditService = CreditService.getInstance();

export const convertStepsToCredits = (steps: number) => creditService.convertStepsToCredits(steps);
export const getUserBalance = () => creditService.getUserBalance();
export const getCreditTransactions = (limit?: number, offset?: number, type?: string) => 
  creditService.getCreditTransactions(limit, offset, type);
export const spendCredits = (amount: number, description: string, rewardId: string) => 
  creditService.spendCredits(amount, description, rewardId);
export const estimateCreditsFromSteps = (steps: number) => creditService.estimateCreditsFromSteps(steps);
export const getCreditEarningRates = () => creditService.getCreditEarningRates();
export const getAvailableRewards = () => creditService.getAvailableRewards();
export const redeemReward = (rewardId: string) => creditService.redeemReward(rewardId);
export const getUserRedemptions = () => creditService.getUserRedemptions();
export const clearCreditCache = () => creditService.clearCache();

export default creditService; 