import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import Joi from 'joi';
import { StepData, DeviceInfo, ApiResponse } from '../../../shared/types';

dotenv.config();

const app = express();
const PORT = process.env.STEP_TRACKER_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/step-credit';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Step Data Schema
const stepDataSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  steps: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true, index: true },
  distance: { type: Number, min: 0 },
  calories: { type: Number, min: 0 },
  activeMinutes: { type: Number, min: 0 },
  deviceInfo: {
    deviceId: { type: String, required: true },
    platform: { type: String, enum: ['ios', 'android'], required: true },
    model: { type: String, required: true },
    osVersion: { type: String, required: true },
    appVersion: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for efficient queries
stepDataSchema.index({ userId: 1, date: 1 });
stepDataSchema.index({ date: 1 });

const StepDataModel = mongoose.model('StepData', stepDataSchema);

// Validation schemas
const stepDataValidation = Joi.object({
  userId: Joi.string().required(),
  steps: Joi.number().integer().min(0).max(100000).required(),
  date: Joi.date().iso().required(),
  distance: Joi.number().min(0).max(1000000).optional(),
  calories: Joi.number().min(0).max(10000).optional(),
  activeMinutes: Joi.number().min(0).max(1440).optional(),
  deviceInfo: Joi.object({
    deviceId: Joi.string().required(),
    platform: Joi.string().valid('ios', 'android').required(),
    model: Joi.string().required(),
    osVersion: Joi.string().required(),
    appVersion: Joi.string().required()
  }).required()
});

const bulkStepDataValidation = Joi.array().items(stepDataValidation).max(100);

// Utility functions
const calculateDistance = (steps: number, userHeight?: number): number => {
  // Average step length calculation based on height
  const avgStepLength = userHeight ? userHeight * 0.43 : 70; // cm
  return (steps * avgStepLength) / 100000; // Convert to km
};

const calculateCalories = (steps: number, userWeight?: number): number => {
  // Rough calorie calculation: 1 step ≈ 0.04 calories for average person
  const baseCaloriesPerStep = 0.04;
  const weightMultiplier = userWeight ? userWeight / 70 : 1; // 70kg as baseline
  return Math.round(steps * baseCaloriesPerStep * weightMultiplier);
};

// Routes

// Health check
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      service: 'step-tracker',
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0'
    }
  };
  res.json(response);
});

// Submit step data (single entry)
app.post('/steps', async (req, res) => {
  try {
    const { error, value } = stepDataValidation.validate(req.body);
    
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

    const stepData: StepData = {
      id: uuidv4(),
      ...value,
      date: new Date(value.date),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Enhanced data with calculations
    if (!stepData.distance) {
      stepData.distance = calculateDistance(stepData.steps);
    }
    
    if (!stepData.calories) {
      stepData.calories = calculateCalories(stepData.steps);
    }

    // Check for duplicate data (same user, same day)
    const existingData = await StepDataModel.findOne({
      userId: stepData.userId,
      date: {
        $gte: moment(stepData.date).startOf('day').toDate(),
        $lte: moment(stepData.date).endOf('day').toDate()
      }
    });

    let savedData;
    if (existingData) {
      // Update existing data with higher step count or merge data
      if (stepData.steps > existingData.steps) {
        existingData.steps = stepData.steps;
        existingData.distance = stepData.distance;
        existingData.calories = stepData.calories;
        existingData.activeMinutes = stepData.activeMinutes || existingData.activeMinutes;
        existingData.updatedAt = new Date();
        savedData = await existingData.save();
      } else {
        savedData = existingData;
      }
    } else {
      // Create new entry
      savedData = await StepDataModel.create(stepData);
    }

    const response: ApiResponse = {
      success: true,
      data: savedData
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving step data:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to save step data',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Submit bulk step data
app.post('/steps/bulk', async (req, res) => {
  try {
    const { error, value } = bulkStepDataValidation.validate(req.body);
    
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

    const processedData = value.map((data: any) => ({
      id: uuidv4(),
      ...data,
      date: new Date(data.date),
      distance: data.distance || calculateDistance(data.steps),
      calories: data.calories || calculateCalories(data.steps),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const savedData = await StepDataModel.insertMany(processedData, { ordered: false });

    const response: ApiResponse = {
      success: true,
      data: {
        processed: savedData.length,
        total: value.length
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving bulk step data:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to save bulk step data',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get user's step data
app.get('/steps/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    const query: any = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const stepData = await StepDataModel
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit as string))
      .lean();

    const response: ApiResponse = {
      success: true,
      data: stepData,
      metadata: {
        total: stepData.length,
        limit: parseInt(limit as string)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching step data:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch step data',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get daily step summary
app.get('/steps/:userId/daily', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    const targetDate = date ? moment(date as string) : moment();
    
    const stepData = await StepDataModel.findOne({
      userId,
      date: {
        $gte: targetDate.startOf('day').toDate(),
        $lte: targetDate.endOf('day').toDate()
      }
    }).lean();

    const response: ApiResponse = {
      success: true,
      data: stepData || {
        steps: 0,
        distance: 0,
        calories: 0,
        activeMinutes: 0,
        date: targetDate.toDate()
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching daily step data:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch daily step data',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get weekly step summary
app.get('/steps/:userId/weekly', async (req, res) => {
  try {
    const { userId } = req.params;
    const { week } = req.query;
    
    const targetWeek = week ? moment(week as string) : moment();
    const startOfWeek = targetWeek.clone().startOf('week');
    const endOfWeek = targetWeek.clone().endOf('week');

    const stepData = await StepDataModel.find({
      userId,
      date: {
        $gte: startOfWeek.toDate(),
        $lte: endOfWeek.toDate()
      }
    }).sort({ date: 1 }).lean();

    const weeklyTotal = stepData.reduce((total, day) => ({
      steps: total.steps + day.steps,
      distance: total.distance + (day.distance || 0),
      calories: total.calories + (day.calories || 0),
      activeMinutes: total.activeMinutes + (day.activeMinutes || 0)
    }), { steps: 0, distance: 0, calories: 0, activeMinutes: 0 });

    const response: ApiResponse = {
      success: true,
      data: {
        weeklyTotal,
        dailyData: stepData,
        weekStart: startOfWeek.toDate(),
        weekEnd: endOfWeek.toDate()
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching weekly step data:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch weekly step data',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Get user statistics
app.get('/steps/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [totalStats, recentData] = await Promise.all([
      StepDataModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalSteps: { $sum: '$steps' },
            totalDistance: { $sum: '$distance' },
            totalCalories: { $sum: '$calories' },
            avgSteps: { $avg: '$steps' },
            maxSteps: { $max: '$steps' },
            daysTracked: { $sum: 1 }
          }
        }
      ]),
      StepDataModel.find({ userId })
        .sort({ date: -1 })
        .limit(30)
        .lean()
    ]);

    const stats = totalStats[0] || {
      totalSteps: 0,
      totalDistance: 0,
      totalCalories: 0,
      avgSteps: 0,
      maxSteps: 0,
      daysTracked: 0
    };

    const response: ApiResponse = {
      success: true,
      data: {
        ...stats,
        recentActivity: recentData
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user statistics',
        timestamp: new Date()
      }
    };
    res.status(500).json(response);
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🏃‍♂️ Step Tracker Service running on port ${PORT}`);
  });
};

startServer().catch(console.error);

export default app; 