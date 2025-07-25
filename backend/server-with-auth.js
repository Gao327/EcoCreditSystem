const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'; // Replace with real client ID

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Initialize SQLite database
const db = new sqlite3.Database('./stepcredit.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📊 Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Create database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Steps table
  db.run(`CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    steps INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, date)
  )`);

  // Credits table  
  db.run(`CREATE TABLE IF NOT EXISTS credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'earned' or 'spent'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Achievements table
  db.run(`CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, achievement_type)
  )`);

  console.log('✅ Database tables initialized');
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Google OAuth login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    db.get(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleId, email],
      (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
          // Update last login
          db.run(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, picture = ? WHERE id = ?',
            [picture, existingUser.id]
          );
          
          // Generate JWT token
          const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.json({
            success: true,
            token,
            user: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              picture: picture || existingUser.picture
            }
          });
        } else {
          // Create new user
          db.run(
            'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
            [googleId, email, name, picture],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to create user' });
              }

              const userId = this.lastID;
              
              // Generate JWT token
              const token = jwt.sign(
                { userId, email },
                JWT_SECRET,
                { expiresIn: '7d' }
              );

              res.json({
                success: true,
                token,
                user: { id: userId, name, email, picture },
                isNewUser: true
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Invalid Google token' });
  }
});

// Guest login (creates temporary user)
app.post('/api/auth/guest', (req, res) => {
  const guestName = `Guest ${Date.now()}`;
  const guestEmail = `guest_${Date.now()}@stepcredit.com`;

  db.run(
    'INSERT INTO users (email, name, picture) VALUES (?, ?, ?)',
    [guestEmail, guestName, 'https://via.placeholder.com/120/667eea/ffffff?text=G'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create guest user' });
      }

      const userId = this.lastID;
      
      const token = jwt.sign(
        { userId, email: guestEmail, isGuest: true },
        JWT_SECRET,
        { expiresIn: '24h' } // Shorter expiry for guests
      );

      res.json({
        success: true,
        token,
        user: {
          id: userId,
          name: guestName,
          email: guestEmail,
          picture: 'https://via.placeholder.com/120/667eea/ffffff?text=G'
        },
        isGuest: true
      });
    }
  );
});

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, name, picture, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user stats
      db.all(`
        SELECT 
          COALESCE(SUM(steps), 0) as totalSteps,
          COUNT(*) as daysTracked,
          MAX(steps) as maxDailySteps
        FROM steps WHERE user_id = ?
      `, [user.id], (err, stepStats) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        db.get(`
          SELECT COALESCE(SUM(amount), 0) as totalCredits
          FROM credits WHERE user_id = ? AND type = 'earned'
        `, [user.id], (err, creditStats) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            success: true,
            user: {
              ...user,
              stats: {
                totalSteps: stepStats[0]?.totalSteps || 0,
                daysTracked: stepStats[0]?.daysTracked || 0,
                maxDailySteps: stepStats[0]?.maxDailySteps || 0,
                totalCredits: creditStats?.totalCredits || 0
              }
            }
          });
        });
      });
    }
  );
});

// Submit steps
app.post('/api/steps', authenticateToken, (req, res) => {
  const { steps } = req.body;
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  if (!steps || steps < 0) {
    return res.status(400).json({ error: 'Invalid steps count' });
  }

  db.run(
    'INSERT OR REPLACE INTO steps (user_id, steps, date) VALUES (?, ?, ?)',
    [userId, steps, today],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        data: {
          steps,
          date: today,
          userId
        }
      });
    }
  );
});

// Convert green activities (steps) to eco-credits
app.post('/api/credits/convert', authenticateToken, (req, res) => {
  const { steps } = req.body;
  const userId = req.user.userId;

  if (!steps || steps < 0) {
    return res.status(400).json({ error: 'Invalid steps count' });
  }

  // Calculate eco-credits for sustainable transportation
  const baseCredits = Math.floor(steps / 100); // 1 eco-credit per 100 steps
  let bonusCredits = 0;
  
  // Bonus eco-credits for sustainable living milestones
  if (steps >= 10000) bonusCredits = 50;  // Daily sustainable transportation goal
  else if (steps >= 5000) bonusCredits = 25;   // Halfway to sustainable daily goal
  else if (steps >= 1000) bonusCredits = 10;   // Getting started with green living

  const totalCredits = baseCredits + bonusCredits;

  // Save eco-credits to database
  db.run(
    'INSERT INTO credits (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
    [userId, totalCredits, 'earned', `Converted ${steps} steps of sustainable transportation`],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Check for green living achievements
      checkAchievements(userId, steps, totalCredits);

      res.json({
        success: true,
        data: {
          baseCredits,
          bonusCredits,
          totalCredits,
          sustainableGoalProgress: Math.min(steps / 10000, 1) * 100,
          message: `Converted ${steps} steps of sustainable transportation into ${totalCredits} eco-credits!`
        }
      });
    }
  );
});

// Get user's total credits
app.get('/api/credits/balance', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'earned' THEN amount ELSE 0 END), 0) as earned,
      COALESCE(SUM(CASE WHEN type = 'spent' THEN amount ELSE 0 END), 0) as spent
    FROM credits WHERE user_id = ?
  `, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const balance = (result?.earned || 0) - (result?.spent || 0);

    res.json({
      success: true,
      balance: {
        available: balance,
        earned: result?.earned || 0,
        spent: result?.spent || 0
      }
    });
  });
});

// Get user achievements
app.get('/api/achievements', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    'SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC',
    [userId],
    (err, achievements) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        achievements: achievements || []
      });
    }
  );
});

// Check and unlock green living achievements
function checkAchievements(userId, steps, credits) {
  const achievements = [
    { type: 'first_steps', condition: steps >= 100, name: '🌱 First Steps', description: 'Complete your first 100 steps of sustainable transportation' },
    { type: 'walker', condition: steps >= 1000, name: '🚶‍♂️ Green Walker', description: 'Walk 1,000 steps in a day (reducing carbon footprint)' },
    { type: 'stepper', condition: steps >= 5000, name: '🏃‍♀️ Eco Stepper', description: 'Walk 5,000 steps in a day (halfway to sustainable goal)' },
    { type: 'goal_crusher', condition: steps >= 10000, name: '🏆 Sustainable Champion', description: 'Reach the daily sustainable transportation goal of 10,000 steps' },
  ];

  achievements.forEach(achievement => {
    if (achievement.condition) {
      db.run(
        'INSERT OR IGNORE INTO achievements (user_id, achievement_type) VALUES (?, ?)',
        [userId, achievement.type],
        (err) => {
          if (!err) {
            console.log(`🏆 Achievement unlocked for user ${userId}: ${achievement.name}`);
          }
        }
      );
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🌱 EcoCredit System - Green Living Platform running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Authentication endpoints available`);
  console.log(`💾 SQLite database: stepcredit.db`);
  console.log(`🌍 Promoting sustainable living through gamification!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('📊 Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = app; 