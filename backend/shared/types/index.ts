// User Management Types
export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

// Step Tracking Types
export interface StepData {
  id: string;
  userId: string;
  steps: number;
  date: Date;
  distance?: number; // in meters
  calories?: number;
  activeMinutes?: number;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android';
  model: string;
  osVersion: string;
  appVersion: string;
}

// Credit System Types
export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  source: CreditSource;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreditBalance {
  userId: string;
  totalCredits: number;
  availableCredits: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastUpdated: Date;
}

export type CreditSource = 
  | 'daily_steps'
  | 'weekly_goal'
  | 'monthly_challenge'
  | 'referral_bonus'
  | 'login_streak'
  | 'achievement'
  | 'purchase'
  | 'admin_adjustment';

// Achievement System Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  criteria: AchievementCriteria;
  reward: AchievementReward;
  isActive: boolean;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export type AchievementType = 
  | 'steps_milestone'
  | 'consistency'
  | 'distance'
  | 'streak'
  | 'social'
  | 'special_event';

export interface AchievementCriteria {
  type: string;
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  conditions?: Record<string, any>;
}

export interface AchievementReward {
  credits: number;
  badges?: string[];
  title?: string;
  multiplier?: number;
}

// Reward System Types
export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  cost: number;
  category: RewardCategory;
  availability: RewardAvailability;
  metadata: RewardMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  cost: number;
  status: RedemptionStatus;
  redeemedAt: Date;
  fulfilledAt?: Date;
  metadata?: Record<string, any>;
}

export type RewardType = 
  | 'digital_coupon'
  | 'physical_item'
  | 'experience'
  | 'charity_donation'
  | 'premium_feature'
  | 'virtual_item';

export type RewardCategory = 
  | 'fitness'
  | 'food_beverage'
  | 'entertainment'
  | 'shopping'
  | 'travel'
  | 'health'
  | 'environment'
  | 'charity';

export interface RewardAvailability {
  startDate?: Date;
  endDate?: Date;
  quantity?: number;
  userLimit?: number;
  requiresLevel?: number;
  geofencing?: string[];
}

export interface RewardMetadata {
  images: string[];
  termsAndConditions?: string;
  instructions?: string;
  vendor?: VendorInfo;
  digitalCode?: boolean;
  physicalShipping?: boolean;
}

export interface VendorInfo {
  name: string;
  contact: string;
  logo?: string;
  website?: string;
}

export type RedemptionStatus = 
  | 'pending'
  | 'processing'
  | 'fulfilled'
  | 'cancelled'
  | 'expired';

// Challenge System Types
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  startDate: Date;
  endDate: Date;
  criteria: ChallengeCriteria;
  rewards: ChallengeReward[];
  participants: number;
  maxParticipants?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  rank?: number;
}

export type ChallengeType = 
  | 'individual'
  | 'team'
  | 'community'
  | 'global';

export interface ChallengeCriteria {
  target: number;
  metric: 'steps' | 'distance' | 'calories' | 'active_minutes' | 'days_active';
  aggregation: 'total' | 'average' | 'max' | 'streak';
}

export interface ChallengeReward {
  rank: number;
  credits: number;
  badges?: string[];
  title?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Authentication Types
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export type UserRole = 'user' | 'admin' | 'moderator';

// Service Communication Types
export interface ServiceRequest<T = any> {
  action: string;
  payload: T;
  metadata: {
    requestId: string;
    userId?: string;
    timestamp: Date;
    source: string;
  };
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
  };
}

// Configuration Types
export interface DatabaseConfig {
  uri: string;
  name: string;
  options?: Record<string, any>;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface HuaweiCloudConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  projectId: string;
  endpoints: {
    obs: string;
    ecs: string;
    vpc: string;
  };
}

export interface ServiceConfig {
  port: number;
  name: string;
  version: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  huaweiCloud: HuaweiCloudConfig;
  jwt: {
    secret: string;
    expirationTime: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
} 