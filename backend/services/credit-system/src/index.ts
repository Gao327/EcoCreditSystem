import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import Joi from 'joi';
import axios from 'axios';
import cron from 'node-cron';
import {
  CreditTransaction,
  CreditBalance,
  CreditSource,
  Achievement,
  UserAchievement,
  Challenge,
  UserChallenge,
  ApiResponse
} from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.CREDIT_SYSTEM_PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/step-credit';
    await mongoose.connect(mongoUri);
    console.log('✅ Credit System connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Credit Transaction Schema
const creditTransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['earned', 'spent', 'bonus', 'penalty'], required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

creditTransactionSchema.index({ userId: 1, createdAt: -1 });

// Credit Balance Schema
const creditBalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  totalCredits: { type: Number, default: 0, min: 0 },
  availableCredits: { type: Number, default: 0, min: 0 },
  pendingCredits: { type: Number, default: 0, min: 0 },
  lifetimeEarned: { type: Number, default: 0, min: 0 },
  lifetimeSpent: { type: Number, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  criteria: { type: Object, required: true },
  reward: { type: Object, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// User Achievement Schema
const userAchievementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  achievementId: { type: String, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const CreditTransactionModel = mongoose.model('CreditTransaction', creditTransactionSchema);
const CreditBalanceModel = mongoose.model('CreditBalance', creditBalanceSchema);
const AchievementModel = mongoose.model('Achievement', achievementSchema);
const UserAchievementModel = mongoose.model('UserAchievement', userAchievementSchema);

// Credit conversion rates
const CREDIT_CONVERSION_RATES = {
  STEPS_TO_CREDITS: 0.01, // 1 credit per 100 steps
  DAILY_GOAL_BONUS: 50, // Bonus for reaching daily goal (10,000 steps)
  WEEKLY_GOAL_BONUS: 200, // Bonus for reaching weekly goal
  STREAK_MULTIPLIER: 1.2, // 20% bonus for consecutive days
  MIN_STEPS_FOR_CREDITS: 1000 // Minimum steps to earn credits
};

// Utility functions
const calculateStepCredits = (steps: number): number => {
  if (steps < CREDIT_CONVERSION_RATES.MIN_STEPS_FOR_CREDITS) {
    return 0;
  }
  return Math.floor(steps * CREDIT_CONVERSION_RATES.STEPS_TO_CREDITS);
};

const updateUserBalance = async (userId: string, amount: number, type: 'earned' | 'spent'): Promise<CreditBalance> => {
  let balance = await CreditBalanceModel.findOne({ userId });
  
  if (!balance) {
    balance = new CreditBalanceModel({ userId });
  }

  if (type === 'earned') {
    balance.totalCredits += amount;
    balance.availableCredits += amount;
    balance.lifetimeEarned += amount;
  } else if (type === 'spent') {
    if (balance.availableCredits < amount) {
      throw new Error('Insufficient credits');
    }
    balance.availableCredits -= amount;
    balance.lifetimeSpent += amount;
  }

  balance.lastUpdated = new Date();
  return await balance.save();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      service: 'credit-system',
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    }
  };
  res.json(response);
});

// Convert steps to credits
app.post('/credits/convert-steps', async (req, res) => {
  try {
    const { userId, steps, date } = req.body;

    if (!userId || !steps || steps < 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid userId and steps are required',
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    const creditsEarned = calculateStepCredits(steps);
    
    if (creditsEarned === 0) {
      const response: ApiResponse = {
        success: true,
        data: {
          creditsEarned: 0,
          message: `Minimum ${CREDIT_CONVERSION_RATES.MIN_STEPS_FOR_CREDITS} steps required to earn credits`
        }
      };
      return res.json(response);
    }

    // Create credit transaction
    const transaction: CreditTransaction = {
      id: uuidv4(),
      userId,
      type: 'earned',
      amount: creditsEarned,
      source: 'daily_steps',
      description: `Earned ${creditsEarned} credits for ${steps} steps`,
      metadata: { steps, date: date || new Date() },
      createdAt: new Date()
    };

    // Check for daily goal bonus
    let bonusCredits = 0;
    if (steps >= 10000) {
      bonusCredits = CREDIT_CONVERSION_RATES.DAILY_GOAL_BONUS;
      
      const bonusTransaction: CreditTransaction = {
        id: uuidv4(),
        userId,
        type: 'bonus',
        amount: bonusCredits,
        source: 'daily_goal',
        description: 'Daily goal bonus for 10,000+ steps',
        metadata: { steps, date: date || new Date() },
        createdAt: new Date()
      };

      await CreditTransactionModel.create(bonusTransaction);
      await updateUserBalance(userId, bonusCredits, 'earned');
    }

    // Save main transaction and update balance
    await CreditTransactionModel.create(transaction);
    const updatedBalance = await updateUserBalance(userId, creditsEarned, 'earned');

    // Check for achievements
    await checkAndUpdateAchievements(userId, steps);

    const response: ApiResponse = {
      success: true,
      data: {
        creditsEarned: creditsEarned + bonusCredits,
        baseCredits: creditsEarned,
        bonusCredits,
        balance: updatedBalance,
        transaction
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error converting steps to credits:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to convert steps to credits',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get user credit balance
app.get('/credits/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let balance = await CreditBalanceModel.findOne({ userId });
    
    if (!balance) {
      balance = await CreditBalanceModel.create({
        userId,
        totalCredits: 0,
        availableCredits: 0,
        pendingCredits: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0
      });
    }

    const response: ApiResponse = {
      success: true,
      data: balance
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch credit balance',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get credit transaction history
app.get('/credits/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, type } = req.query;

    const query: any = { userId };
    if (type) {
      query.type = type;
    }

    const transactions = await CreditTransactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();

    const total = await CreditTransactionModel.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      data: transactions,
      metadata: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasNextPage: total > parseInt(offset as string) + parseInt(limit as string)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch transactions',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Spend credits (for rewards)
app.post('/credits/:userId/spend', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description, rewardId } = req.body;

    if (!amount || amount <= 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid amount is required',
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    // Check balance
    const balance = await CreditBalanceModel.findOne({ userId });
    if (!balance || balance.availableCredits < amount) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits for this transaction',
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    // Create transaction
    const transaction: CreditTransaction = {
      id: uuidv4(),
      userId,
      type: 'spent',
      amount,
      source: 'reward_redemption',
      description: description || 'Credits spent on reward',
      metadata: { rewardId },
      createdAt: new Date()
    };

    await CreditTransactionModel.create(transaction);
    const updatedBalance = await updateUserBalance(userId, amount, 'spent');

    const response: ApiResponse = {
      success: true,
      data: {
        transaction,
        updatedBalance
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error spending credits:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to spend credits',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Achievement checking function
const checkAndUpdateAchievements = async (userId: string, steps: number) => {
  try {
    // Get all active achievements
    const achievements = await AchievementModel.find({ isActive: true });
    
    for (const achievement of achievements) {
      let userAchievement = await UserAchievementModel.findOne({
        userId,
        achievementId: achievement.id
      });

      if (!userAchievement) {
        userAchievement = await UserAchievementModel.create({
          id: uuidv4(),
          userId,
          achievementId: achievement.id,
          progress: 0,
          isCompleted: false
        });
      }

      if (!userAchievement.isCompleted) {
        // Update progress based on achievement type
        if (achievement.type === 'steps_milestone') {
          const target = achievement.criteria.target;
          const progress = Math.min((steps / target) * 100, 100);
          
          userAchievement.progress = progress;
          
          if (progress >= 100) {
            userAchievement.isCompleted = true;
            userAchievement.completedAt = new Date();
            
            // Award achievement credits
            const rewardCredits = achievement.reward.credits;
            if (rewardCredits > 0) {
              const rewardTransaction: CreditTransaction = {
                id: uuidv4(),
                userId,
                type: 'bonus',
                amount: rewardCredits,
                source: 'achievement',
                description: `Achievement reward: ${achievement.name}`,
                metadata: { achievementId: achievement.id },
                createdAt: new Date()
              };

              await CreditTransactionModel.create(rewardTransaction);
              await updateUserBalance(userId, rewardCredits, 'earned');
            }
          }
        }
        
        await userAchievement.save();
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

// Get user achievements
app.get('/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userAchievements = await UserAchievementModel.find({ userId })
      .populate('achievementId')
      .lean();

    const response: ApiResponse = {
      success: true,
      data: userAchievements
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch achievements',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Initialize default achievements
const initializeAchievements = async () => {
  const defaultAchievements = [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Take your first 1,000 steps',
      type: 'steps_milestone',
      criteria: { target: 1000, type: 'daily_steps' },
      reward: { credits: 10, badges: ['first_steps'] }
    },
    {
      id: 'daily_walker',
      name: 'Daily Walker',
      description: 'Walk 5,000 steps in a day',
      type: 'steps_milestone',
      criteria: { target: 5000, type: 'daily_steps' },
      reward: { credits: 25, badges: ['daily_walker'] }
    },
    {
      id: 'goal_crusher',
      name: 'Goal Crusher',
      description: 'Reach 10,000 steps in a day',
      type: 'steps_milestone',
      criteria: { target: 10000, type: 'daily_steps' },
      reward: { credits: 50, badges: ['goal_crusher'] }
    },
    {
      id: 'marathon_master',
      name: 'Marathon Master',
      description: 'Walk 25,000 steps in a day',
      type: 'steps_milestone',
      criteria: { target: 25000, type: 'daily_steps' },
      reward: { credits: 100, badges: ['marathon_master'] }
    }
  ];

  for (const achievement of defaultAchievements) {
    await AchievementModel.findOneAndUpdate(
      { id: achievement.id },
      { ...achievement, isActive: true },
      { upsert: true }
    );
  }
  
  console.log('✅ Default achievements initialized');
};

// Start server
const startServer = async () => {
  await connectDB();
  await initializeAchievements();
  
  app.listen(PORT, () => {
    console.log(`💰 Credit System Service running on port ${PORT}`);
  });
};

startServer().catch(console.error);

 