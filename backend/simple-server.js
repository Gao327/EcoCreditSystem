const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a real database)
const userData = new Map();

// Credit conversion algorithm
function calculateCredits(steps) {
  const baseCredits = Math.floor(steps / 100); // 1 credit per 100 steps
  
  // Bonus credits for milestones
  let bonusCredits = 0;
  if (steps >= 10000) bonusCredits += 50;  // Daily goal bonus
  else if (steps >= 5000) bonusCredits += 25;   // Halfway bonus
  else if (steps >= 1000) bonusCredits += 10;   // Getting started bonus
  
  return {
    baseCredits,
    bonusCredits,
    totalCredits: baseCredits + bonusCredits,
    stepGoalProgress: Math.min(steps / 10000, 1) * 100
  };
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Submit step data
app.post('/api/steps', (req, res) => {
  try {
    const { userId = 'demo_user', steps, timestamp } = req.body;
    
    if (!steps || steps < 0) {
      return res.status(400).json({ error: 'Invalid steps count' });
    }

    // Get or create user data
    if (!userData.has(userId)) {
      userData.set(userId, {
        totalSteps: 0,
        totalCredits: 0,
        dailySteps: {},
        lastUpdated: new Date()
      });
    }

    const user = userData.get(userId);
    const today = new Date().toDateString();
    
    // Update daily steps
    user.dailySteps[today] = steps;
    user.totalSteps = Object.values(user.dailySteps).reduce((sum, s) => sum + s, 0);
    user.lastUpdated = new Date();
    
    userData.set(userId, user);

    res.json({
      success: true,
      data: {
        steps,
        userId,
        timestamp: new Date().toISOString(),
        dailyTotal: steps
      }
    });
  } catch (error) {
    console.error('Error submitting steps:', error);
    res.status(500).json({ error: 'Failed to submit steps' });
  }
});

// Convert steps to credits
app.post('/api/credits/convert', (req, res) => {
  try {
    const { userId = 'demo_user', steps } = req.body;

    if (!steps || steps < 0) {
      return res.status(400).json({ error: 'Invalid steps count' });
    }

    // Calculate credits
    const creditCalculation = calculateCredits(steps);
    
    // Update user credits
    if (!userData.has(userId)) {
      userData.set(userId, {
        totalSteps: 0,
        totalCredits: 0,
        dailySteps: {},
        lastUpdated: new Date()
      });
    }

    const user = userData.get(userId);
    user.totalCredits += creditCalculation.totalCredits;
    userData.set(userId, user);

    res.json({
      success: true,
      data: {
        ...creditCalculation,
        newTotalCredits: user.totalCredits,
        message: `Converted ${steps} steps into ${creditCalculation.totalCredits} credits!`
      }
    });
  } catch (error) {
    console.error('Error converting credits:', error);
    res.status(500).json({ error: 'Failed to convert credits' });
  }
});

// Get user stats
app.get('/api/user/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userData.has(userId)) {
      return res.json({
        totalSteps: 0,
        totalCredits: 0,
        dailySteps: {},
        daysTracked: 0
      });
    }

    const user = userData.get(userId);
    const dailySteps = Object.values(user.dailySteps);
    
    res.json({
      totalSteps: user.totalSteps,
      totalCredits: user.totalCredits,
      dailySteps: user.dailySteps,
      daysTracked: Object.keys(user.dailySteps).length,
      averageDaily: dailySteps.length > 0 ? Math.round(dailySteps.reduce((a, b) => a + b, 0) / dailySteps.length) : 0,
      maxDaily: dailySteps.length > 0 ? Math.max(...dailySteps) : 0,
      lastUpdated: user.lastUpdated
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get today's step data
app.get('/api/steps/today/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toDateString();
    
    if (!userData.has(userId)) {
      return res.json({ steps: 0, credits: 0 });
    }

    const user = userData.get(userId);
    const todaySteps = user.dailySteps[today] || 0;
    const creditInfo = calculateCredits(todaySteps);
    
    res.json({
      steps: todaySteps,
      credits: user.totalCredits,
      todaysPotentialCredits: creditInfo.totalCredits,
      goalProgress: creditInfo.stepGoalProgress
    });
  } catch (error) {
    console.error('Error getting today steps:', error);
    res.status(500).json({ error: 'Failed to get today steps' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Step Credit Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Ready for step tracking and credit conversion!`);
});

module.exports = app; 