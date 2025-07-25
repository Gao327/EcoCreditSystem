
# 🌱 EcoCredit System - Green Living Promotion Platform

A comprehensive platform that promotes sustainable living by rewarding eco-friendly behaviors. The system converts various green activities (starting with step tracking) into credits that users can redeem for rewards, encouraging a more sustainable lifestyle.

## 🌍 **Project Overview**

The **EcoCredit System** is designed to motivate users towards sustainable living through gamification. While step tracking is the initial feature (as it's the simplest to implement), the system is architected to support various green activities:

- **Step Tracking** 🚶‍♂️ - Encourages walking/cycling instead of driving
- **Future Features** - Energy conservation, waste reduction, sustainable shopping, etc.
- **Credit System** 💚 - Converts green activities into redeemable credits
- **Achievement System** 🏆 - Gamifies sustainable behaviors
- **Community Features** 👥 - Social sharing and challenges (planned)

## ✨ **Key Features**

### 🌱 **Green Activity Tracking**
- **Step Conversion**: Convert daily steps into eco-credits
- **Smart Algorithm**: Rewards sustainable transportation choices
- **Goal Setting**: Personalized daily/weekly green activity targets

### 💚 **Eco-Credit System**
- **Activity Conversion**: Transform green behaviors into credits
- **Bonus Rewards**: Extra credits for milestone achievements
- **Credit Balance**: Track and manage your eco-credit wallet

### 🏆 **Achievement System**
- **Green Milestones**: Unlock achievements for sustainable behaviors
- **Progressive Rewards**: Earn more credits as you advance
- **Badge Collection**: Visual representation of your green journey

### 🔐 **User Management**
- **Google OAuth**: Secure login with Google accounts
- **Guest Access**: Try the system without registration
- **Profile Management**: Track your green living progress

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Mobile App     │    │   API Gateway   │
│   (HTML/CSS/JS) │    │  (React Native) │    │   (Express.js)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                └───────────────────────┼───┐
                                                        │   │
                                ┌───────────────────────┼───┘
                                │                       │
                        ┌───────▼────────┐    ┌─────────▼────────┐
                        │  Green Activity│    │   Eco-Credit     │
                        │   Tracker      │    │    System        │
                        │  (Step Data)   │    │  (Credits/Rewards)│
                        └────────────────┘    └──────────────────┘
                                │                       │
                                └───────────────────────┼───┐
                                                        │   │
                                ┌───────────────────────┼───┘
                                │                       │
                        ┌───────▼───────────────────────▼────────┐
                        │           SQLite Database              │
                        │     (Users, Activities, Credits)       │
                        └────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gao327/EcoCreditSystem.git
   cd EcoCreditSystem
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the server**
   ```bash
   node server-with-auth.js
   ```

4. **Open the application**
   - Navigate to `http://localhost:3000/app-with-auth.html`
   - Or open `backend/app-with-auth.html` in your browser

## 🧪 **Testing the Application**

### 1. **Guest Login (Quick Test)**
```bash
# Start the server
cd backend && node server-with-auth.js

# Open in browser: http://localhost:3000/app-with-auth.html
# Click "Continue as Guest" to test immediately
```

### 2. **Google OAuth Login**
- Click "Sign in with Google" 
- Complete Google authentication
- Your green activity data will be saved permanently

### 3. **API Testing with curl**
```bash
# Health check
curl http://localhost:3000/health

# Guest login
curl -X POST http://localhost:3000/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device-123"}'

# Submit green activity (steps)
curl -X POST http://localhost:3000/api/steps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"steps": 8500, "date": "2024-01-15"}'

# Convert activities to eco-credits
curl -X POST http://localhost:3000/api/credits/convert \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check credit balance
curl http://localhost:3000/api/credits/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user profile with green activity stats
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🌱 **Green Activity Algorithm**

The system uses a sophisticated algorithm to convert green activities into eco-credits:

### **Step Conversion Formula**
```javascript
// Base credits: 1 credit per 100 steps
const baseCredits = Math.floor(steps / 100);

// Bonus credits for sustainable transportation milestones
let bonusCredits = 0;
if (steps >= 10000) bonusCredits += 50;  // Daily goal bonus
else if (steps >= 5000) bonusCredits += 25;   // Halfway bonus
else if (steps >= 1000) bonusCredits += 10;   // Getting started bonus

// Total eco-credits earned
const totalCredits = baseCredits + bonusCredits;
```

### **Why Steps Matter for Green Living**
- **Reduced Carbon Footprint**: Walking/cycling instead of driving
- **Health Benefits**: Encourages active transportation
- **Community Impact**: Less traffic congestion and pollution
- **Measurable Impact**: Easy to track and quantify

## 🏗️ **Architecture Details**

### **Backend Services**
- **Express.js Server**: RESTful API with JWT authentication
- **SQLite Database**: Lightweight, persistent data storage
- **Google OAuth**: Secure user authentication
- **Credit System**: Activity-to-credit conversion engine

### **Frontend Components**
- **Responsive Web App**: Works on desktop and mobile
- **Modern UI**: Glass-morphism design with green theme
- **Real-time Updates**: Live activity and credit tracking
- **Progressive Web App**: Can be installed on mobile devices

### **Database Schema**
```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  google_id TEXT UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Green activities table
CREATE TABLE steps (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  steps INTEGER,
  date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Eco-credits table
CREATE TABLE credits (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  amount INTEGER,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Achievements table
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  type TEXT,
  title TEXT,
  description TEXT,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/guest` - Guest login

### **Green Activities**
- `POST /api/steps` - Submit daily step count
- `GET /api/steps/today/:userId` - Get today's steps

### **Eco-Credits**
- `POST /api/credits/convert` - Convert activities to credits
- `GET /api/credits/balance` - Get current credit balance

### **User Management**
- `GET /api/user/profile` - Get user profile with stats
- `GET /api/achievements` - Get user achievements

## ⚙️ **Configuration**

### **Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Update `GOOGLE_CLIENT_ID` in your `.env` file

## 🔒 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Industry-standard OAuth 2.0
- **Input Validation**: All user inputs are validated
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing

## 🏆 **Achievement System**

### **Current Achievements**
- **🌱 First Steps**: Complete your first 1,000 steps
- **🚶‍♂️ Halfway There**: Reach 5,000 steps in a day
- **🏃‍♂️ Daily Goal**: Achieve 10,000 steps in a day
- **💚 Green Warrior**: Earn your first 100 eco-credits
- **🌟 Credit Collector**: Accumulate 500 total credits

### **Future Achievement Ideas**
- **🌿 Weekly Streak**: 7 consecutive days of green activities
- **🚲 Bike Commuter**: Track cycling activities
- **♻️ Waste Warrior**: Log recycling activities
- **🌱 Plant Parent**: Document plant care activities
- **💡 Energy Saver**: Track energy conservation activities

## 🌐 **Browser Compatibility**

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **Mobile Browsers**: iOS Safari, Chrome Mobile ✅

## 🚀 **Future Enhancements**

### **Planned Green Activities**
- **🚲 Cycling Tracking**: Convert bike rides to credits
- **♻️ Recycling Logging**: Document recycling activities
- **💡 Energy Conservation**: Track electricity/water savings
- **🌱 Sustainable Shopping**: Log eco-friendly purchases
- **🚶‍♂️ Public Transport**: Track bus/train usage

### **Community Features**
- **👥 Green Challenges**: Community-wide sustainability goals
- **🏆 Leaderboards**: Compare green living progress
- **📱 Social Sharing**: Share achievements on social media
- **🌍 Impact Visualization**: Show environmental impact

### **Advanced Features**
- **📊 Analytics Dashboard**: Detailed green living insights
- **🎯 Personalized Goals**: AI-driven activity recommendations
- **🌱 Carbon Footprint Calculator**: Environmental impact tracking
- **💚 Credit Marketplace**: Redeem credits for eco-friendly rewards

## 🤝 **Contributing**

We welcome contributions to make the world greener! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/green-activity`)
3. Commit your changes (`git commit -am 'Add new green activity tracking'`)
4. Push to the branch (`git push origin feature/green-activity`)
5. Create a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 **Environmental Impact**

By encouraging sustainable behaviors through gamification, the EcoCredit System aims to:
- **Reduce Carbon Footprints**: Promote walking/cycling over driving
- **Increase Awareness**: Educate users about sustainable living
- **Build Communities**: Connect like-minded environmentalists
- **Drive Change**: Make green living accessible and rewarding

---

**🌱 Start your green living journey today! Every step counts towards a more sustainable future.** 🌍 


