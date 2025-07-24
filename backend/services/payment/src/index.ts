import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import Joi from 'joi';
import axios from 'axios';
import {
  Reward,
  RewardRedemption,
  RewardType,
  RewardCategory,
  RedemptionStatus,
  ApiResponse
} from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.PAYMENT_PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/step-credit';
    await mongoose.connect(mongoUri);
    console.log('✅ Payment Service connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Reward Schema
const rewardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  cost: { type: Number, required: true, min: 1 },
  category: { type: String, required: true },
  availability: {
    startDate: { type: Date },
    endDate: { type: Date },
    quantity: { type: Number, min: 0 },
    userLimit: { type: Number, min: 1 },
    requiresLevel: { type: Number, min: 1 },
    geofencing: [{ type: String }]
  },
  metadata: {
    images: [{ type: String }],
    termsAndConditions: { type: String },
    instructions: { type: String },
    vendor: {
      name: { type: String },
      contact: { type: String },
      logo: { type: String },
      website: { type: String }
    },
    digitalCode: { type: Boolean, default: false },
    physicalShipping: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Reward Redemption Schema
const rewardRedemptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  rewardId: { type: String, required: true },
  cost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'fulfilled', 'cancelled', 'expired'], 
    default: 'pending' 
  },
  redeemedAt: { type: Date, default: Date.now },
  fulfilledAt: { type: Date },
  metadata: {
    digitalCode: { type: String },
    trackingNumber: { type: String },
    shippingAddress: { type: Object },
    notes: { type: String }
  }
});

rewardRedemptionSchema.index({ userId: 1, redeemedAt: -1 });
rewardRedemptionSchema.index({ status: 1 });

const RewardModel = mongoose.model('Reward', rewardSchema);
const RewardRedemptionModel = mongoose.model('RewardRedemption', rewardRedemptionSchema);

// Validation schemas
const rewardValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('digital_coupon', 'physical_item', 'experience', 'charity_donation', 'premium_feature', 'virtual_item').required(),
  cost: Joi.number().integer().min(1).required(),
  category: Joi.string().valid('fitness', 'food_beverage', 'entertainment', 'shopping', 'travel', 'health', 'environment', 'charity').required(),
  availability: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    quantity: Joi.number().integer().min(0).optional(),
    userLimit: Joi.number().integer().min(1).optional(),
    requiresLevel: Joi.number().integer().min(1).optional(),
    geofencing: Joi.array().items(Joi.string()).optional()
  }).optional(),
  metadata: Joi.object({
    images: Joi.array().items(Joi.string()).optional(),
    termsAndConditions: Joi.string().optional(),
    instructions: Joi.string().optional(),
    vendor: Joi.object({
      name: Joi.string().optional(),
      contact: Joi.string().optional(),
      logo: Joi.string().optional(),
      website: Joi.string().optional()
    }).optional(),
    digitalCode: Joi.boolean().optional(),
    physicalShipping: Joi.boolean().optional()
  }).optional()
});

// Utility functions
const generateDigitalCode = (): string => {
  const prefix = 'SC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

const checkCreditBalance = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const response = await axios.get(`${process.env.CREDIT_SYSTEM_URL || 'http://localhost:3002'}/credits/${userId}/balance`);
    const balance = response.data.data;
    return balance.availableCredits >= amount;
  } catch (error) {
    console.error('Error checking credit balance:', error);
    return false;
  }
};

const deductCredits = async (userId: string, amount: number, rewardId: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${process.env.CREDIT_SYSTEM_URL || 'http://localhost:3002'}/credits/${userId}/spend`, {
      amount,
      description: `Reward redemption: ${rewardId}`,
      rewardId
    });
    return response.data.success;
  } catch (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      service: 'payment',
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    }
  };
  res.json(response);
});

// Get all available rewards
app.get('/rewards', async (req, res) => {
  try {
    const { category, type, limit = 50, offset = 0 } = req.query;

    const query: any = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }

    // Filter by availability dates
    const now = new Date();
    query.$or = [
      { 'availability.startDate': { $exists: false } },
      { 'availability.startDate': { $lte: now } }
    ];

    const rewards = await RewardModel
      .find(query)
      .sort({ cost: 1, createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();

    const total = await RewardModel.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      data: rewards,
      metadata: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasNextPage: total > parseInt(offset as string) + parseInt(limit as string)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch rewards',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get reward by ID
app.get('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reward = await RewardModel.findOne({ id, isActive: true });

    if (!reward) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Reward not found',
          timestamp: new Date()
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: reward
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching reward:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch reward',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Redeem reward
app.post('/rewards/redeem', async (req, res) => {
  try {
    const { userId, rewardId } = req.body;

    if (!userId || !rewardId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId and rewardId are required',
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    // Get reward details
    const reward = await RewardModel.findOne({ id: rewardId, isActive: true });

    if (!reward) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Reward not found or no longer available',
          timestamp: new Date()
        }
      };
      return res.status(404).json(response);
    }

    // Check availability constraints
    const now = new Date();
    if (reward.availability.endDate && new Date(reward.availability.endDate) < now) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'REWARD_EXPIRED',
          message: 'This reward has expired',
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    // Check quantity availability
    if (reward.availability.quantity !== undefined) {
      const redeemedCount = await RewardRedemptionModel.countDocuments({
        rewardId,
        status: { $in: ['pending', 'processing', 'fulfilled'] }
      });

      if (redeemedCount >= reward.availability.quantity) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'REWARD_UNAVAILABLE',
            message: 'This reward is currently out of stock',
            timestamp: new Date()
          }
        };
        return res.status(400).json(response);
      }
    }

    // Check user limit
    if (reward.availability.userLimit) {
      const userRedeemedCount = await RewardRedemptionModel.countDocuments({
        userId,
        rewardId,
        status: { $in: ['pending', 'processing', 'fulfilled'] }
      });

      if (userRedeemedCount >= reward.availability.userLimit) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'USER_LIMIT_EXCEEDED',
            message: 'You have reached the limit for this reward',
            timestamp: new Date()
          }
        };
        return res.status(400).json(response);
      }
    }

    // Check credit balance
    const hasCredits = await checkCreditBalance(userId, reward.cost);
    if (!hasCredits) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits for this reward',
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    // Deduct credits
    const creditsDeducted = await deductCredits(userId, reward.cost, rewardId);
    if (!creditsDeducted) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CREDIT_DEDUCTION_FAILED',
          message: 'Failed to deduct credits',
          timestamp: new Date()
        }
      };
      return res.status(500).json(response);
    }

    // Create redemption
    const redemption: RewardRedemption = {
      id: uuidv4(),
      userId,
      rewardId,
      cost: reward.cost,
      status: 'pending',
      redeemedAt: new Date(),
      metadata: {}
    };

    // Generate digital code if needed
    let digitalCode;
    if (reward.metadata.digitalCode) {
      digitalCode = generateDigitalCode();
      redemption.metadata.digitalCode = digitalCode;
      redemption.status = 'fulfilled';
      redemption.fulfilledAt = new Date();
    }

    const savedRedemption = await RewardRedemptionModel.create(redemption);

    const responseData: any = {
      redemption: savedRedemption,
      reward: {
        name: reward.name,
        description: reward.description,
        instructions: reward.metadata.instructions
      }
    };

    if (digitalCode) {
      responseData.digitalCode = digitalCode;
      responseData.instructions = reward.metadata.instructions || 'Use this code to redeem your reward';
    }

    const response: ApiResponse = {
      success: true,
      data: responseData
    };

    res.json(response);
  } catch (error) {
    console.error('Error redeeming reward:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to redeem reward',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get user redemptions
app.get('/rewards/redemptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const redemptions = await RewardRedemptionModel
      .find(query)
      .sort({ redeemedAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .lean();

    // Get reward details for each redemption
    const enrichedRedemptions = await Promise.all(
      redemptions.map(async (redemption) => {
        const reward = await RewardModel.findOne({ id: redemption.rewardId }).lean();
        return {
          ...redemption,
          reward: reward ? {
            name: reward.name,
            description: reward.description,
            category: reward.category,
            type: reward.type
          } : null
        };
      })
    );

    const total = await RewardRedemptionModel.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      data: enrichedRedemptions,
      metadata: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasNextPage: total > parseInt(offset as string) + parseInt(limit as string)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch redemptions',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Admin: Create reward
app.post('/rewards', async (req, res) => {
  try {
    const { error, value } = rewardValidation.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          timestamp: new Date()
        }
      };
      return res.status(400).json(response);
    }

    const reward: Reward = {
      id: uuidv4(),
      ...value,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedReward = await RewardModel.create(reward);

    const response: ApiResponse = {
      success: true,
      data: savedReward
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating reward:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create reward',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Initialize default rewards
const initializeRewards = async () => {
  const defaultRewards = [
    {
      id: 'coffee_voucher',
      name: 'Coffee Voucher',
      description: 'Get a free coffee at partner cafes',
      type: 'digital_coupon',
      cost: 100,
      category: 'food_beverage',
      availability: {
        quantity: 100,
        userLimit: 5
      },
      metadata: {
        images: ['coffee_voucher.jpg'],
        instructions: 'Show this code at any partner cafe to redeem your free coffee',
        vendor: {
          name: 'Coffee Partners',
          contact: 'support@coffeepartners.com'
        },
        digitalCode: true
      }
    },
    {
      id: 'fitness_gear',
      name: 'Fitness Gear Pack',
      description: 'Water bottle, towel, and resistance band',
      type: 'physical_item',
      cost: 500,
      category: 'fitness',
      availability: {
        quantity: 50,
        userLimit: 1
      },
      metadata: {
        images: ['fitness_gear.jpg'],
        instructions: 'Your fitness gear pack will be shipped to your registered address',
        physicalShipping: true
      }
    },
    {
      id: 'tree_planting',
      name: 'Plant a Tree',
      description: 'Contribute to reforestation efforts',
      type: 'charity_donation',
      cost: 200,
      category: 'environment',
      availability: {
        userLimit: 10
      },
      metadata: {
        images: ['tree_planting.jpg'],
        instructions: 'A tree will be planted in your name. You will receive a certificate via email.',
        vendor: {
          name: 'Green Earth Foundation',
          website: 'https://greenearthfoundation.org'
        }
      }
    },
    {
      id: 'premium_features',
      name: 'Premium Features (1 Month)',
      description: 'Unlock advanced analytics and personalized insights',
      type: 'premium_feature',
      cost: 300,
      category: 'fitness',
      availability: {
        userLimit: 3
      },
      metadata: {
        images: ['premium_features.jpg'],
        instructions: 'Premium features will be activated in your account immediately',
        digitalCode: true
      }
    }
  ];

  for (const reward of defaultRewards) {
    await RewardModel.findOneAndUpdate(
      { id: reward.id },
      { ...reward, isActive: true },
      { upsert: true }
    );
  }
  
  console.log('✅ Default rewards initialized');
};

// Start server
const startServer = async () => {
  await connectDB();
  await initializeRewards();
  
  app.listen(PORT, () => {
    console.log(`💰 Payment Service running on port ${PORT}`);
  });
};

startServer().catch(console.error);

export default app; 