// Note: Using mock implementation since expo-pedometer is not available
// In production, you would use: import { Pedometer } from 'expo-pedometer';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Mock Pedometer for demonstration purposes
const Pedometer = {
  isAvailableAsync: async () => true,
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  getStepCountAsync: async (start: Date, end: Date) => ({ 
    steps: Math.floor(Math.random() * 5000) + 2000 // Mock steps between 2000-7000
  }),
  watchStepCount: (callback: (result: { steps: number }) => void) => {
    const interval = setInterval(() => {
      callback({ steps: Math.floor(Math.random() * 5000) + 2000 });
    }, 5000);
    return { remove: () => clearInterval(interval) };
  }
};

interface StepData {
  steps: number;
  date: Date;
  distance?: number;
  calories?: number;
  activeMinutes?: number;
}

interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android';
  model: string;
  osVersion: string;
  appVersion: string;
}

class StepTrackingService {
  private static instance: StepTrackingService;
  private stepCount: number = 0;
  private isTracking: boolean = false;
  private pedometerSubscription: any = null;
  private lastStepCount: number = 0;
  private deviceInfo: DeviceInfo | null = null;

  private constructor() {
    this.initializeDeviceInfo();
  }

  public static getInstance(): StepTrackingService {
    if (!StepTrackingService.instance) {
      StepTrackingService.instance = new StepTrackingService();
    }
    return StepTrackingService.instance;
  }

  private async initializeDeviceInfo() {
    try {
      const deviceId = await this.getOrCreateDeviceId();
      
      this.deviceInfo = {
        deviceId,
        platform: 'ios', // Mock for demo
        model: 'Demo Device',
        osVersion: '17.0',
        appVersion: '1.0.0',
      };
    } catch (error) {
      console.error('Failed to initialize device info:', error);
    }
  }

  private async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await SecureStore.getItemAsync('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await SecureStore.setItemAsync('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error with device ID:', error);
      return `temp_${Date.now()}`;
    }
  }

  async initializeStepTracking(): Promise<boolean> {
    try {
      // Check if step counting is available
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer is not available on this device');
        return false;
      }

      // Request permissions
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Pedometer permissions not granted');
        return false;
      }

      // Get today's step count to start with
      await this.getTodaySteps();
      
      console.log('✅ Step tracking initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize step tracking:', error);
      return false;
    }
  }

  async startStepTracking(): Promise<void> {
    if (this.isTracking) {
      return;
    }

    try {
      // Start live step counting
      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        this.stepCount = result.steps;
      });

      this.isTracking = true;
      console.log('📱 Step tracking started');
    } catch (error) {
      console.error('Error starting step tracking:', error);
    }
  }

  stopStepTracking(): void {
    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }
    this.isTracking = false;
    console.log('📱 Step tracking stopped');
  }

  async getTodaySteps(): Promise<number> {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      const result = await Pedometer.getStepCountAsync(start, end);
      this.stepCount = result.steps;
      return result.steps;
    } catch (error) {
      console.error('Error getting today\'s steps:', error);
      return 0;
    }
  }

  getCurrentSteps(): number {
    return this.stepCount;
  }

  async getWeeklySteps(): Promise<number> {
    try {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps;
    } catch (error) {
      console.error('Error getting weekly steps:', error);
      return 0;
    }
  }

  async syncStepsToServer(steps: number = this.stepCount): Promise<boolean> {
    if (!this.deviceInfo) {
      console.warn('Device info not available for sync');
      return false;
    }

    try {
      const userId = await this.getUserId();
      if (!userId) {
        console.warn('User ID not available for sync');
        return false;
      }

      const stepData = {
        userId,
        steps,
        date: new Date().toISOString(),
        distance: this.calculateDistance(steps),
        calories: this.calculateCalories(steps),
        deviceInfo: this.deviceInfo,
      };

      const response = await axios.post(`${API_BASE_URL}/steps`, stepData);
      
      if (response.data.success) {
        this.lastStepCount = steps;
        await SecureStore.setItemAsync('lastSyncSteps', steps.toString());
        await SecureStore.setItemAsync('lastSyncTime', new Date().toISOString());
        console.log('✅ Steps synced to server');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to sync steps to server:', error);
      return false;
    }
  }

  private calculateDistance(steps: number): number {
    // Average step length calculation (rough estimate)
    const avgStepLengthCm = 70; // cm
    const distanceMeters = (steps * avgStepLengthCm) / 100;
    return Math.round(distanceMeters);
  }

  private calculateCalories(steps: number): number {
    // Rough calorie calculation: 1 step ≈ 0.04 calories
    return Math.round(steps * 0.04);
  }

  private async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('userId') || 'demo_user';
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 'demo_user'; // Fallback for demo
    }
  }

  async getLastSyncInfo(): Promise<{ steps: number; time: Date | null }> {
    try {
      const stepsStr = await SecureStore.getItemAsync('lastSyncSteps');
      const timeStr = await SecureStore.getItemAsync('lastSyncTime');
      
      return {
        steps: stepsStr ? parseInt(stepsStr, 10) : 0,
        time: timeStr ? new Date(timeStr) : null,
      };
    } catch (error) {
      console.error('Error getting last sync info:', error);
      return { steps: 0, time: null };
    }
  }

  async getStepHistory(days: number = 7): Promise<StepData[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) return [];

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await axios.get(`${API_BASE_URL}/steps/${userId}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: days,
        },
      });

      if (response.data.success) {
        return response.data.data.map((item: any) => ({
          steps: item.steps,
          date: new Date(item.date),
          distance: item.distance,
          calories: item.calories,
          activeMinutes: item.activeMinutes,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting step history:', error);
      return [];
    }
  }

  async getUserStats(): Promise<any> {
    try {
      const userId = await this.getUserId();
      if (!userId) return null;

      const response = await axios.get(`${API_BASE_URL}/steps/${userId}/stats`);
      
      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Auto-sync steps periodically
  setupAutoSync(intervalMinutes: number = 30): void {
    setInterval(async () => {
      if (this.isTracking) {
        await this.syncStepsToServer();
      }
    }, intervalMinutes * 60 * 1000);
  }

  getTrackingStatus(): boolean {
    return this.isTracking;
  }
}

// Export singleton instance functions
const stepTrackingService = StepTrackingService.getInstance();

export const initializeStepTracking = () => stepTrackingService.initializeStepTracking();
export const startStepTracking = () => stepTrackingService.startStepTracking();
export const stopStepTracking = () => stepTrackingService.stopStepTracking();
export const getCurrentSteps = () => stepTrackingService.getCurrentSteps();
export const getTodaySteps = () => stepTrackingService.getTodaySteps();
export const getWeeklySteps = () => stepTrackingService.getWeeklySteps();
export const syncStepsToServer = (steps?: number) => stepTrackingService.syncStepsToServer(steps);
export const getStepHistory = (days?: number) => stepTrackingService.getStepHistory(days);
export const getUserStats = () => stepTrackingService.getUserStats();
export const getLastSyncInfo = () => stepTrackingService.getLastSyncInfo();
export const setupAutoSync = (intervalMinutes?: number) => stepTrackingService.setupAutoSync(intervalMinutes);
export const getTrackingStatus = () => stepTrackingService.getTrackingStatus();

export default stepTrackingService; 