
# 🏃‍♂️ Step Credit - Fitness Rewards App

A modern web application that tracks your daily steps and converts them into credits, similar to Ant Forest. Built with Node.js, SQLite, and a beautiful responsive frontend.

## ✨ Features

### 🔐 **User Authentication**
- **Google OAuth 2.0** integration (configurable)
- **Guest accounts** for instant access
- **JWT-based** secure authentication
- **Persistent sessions** across devices

### 📱 **Step Tracking & Rewards**
- **Real-time step counting** (mock implementation for demo)
- **Credit conversion algorithm** with bonus milestones
- **Progress tracking** toward daily goals (10,000 steps)
- **Achievement system** with unlockable rewards

### 💾 **Database & Persistence**
- **SQLite database** for reliable data storage
- **User profiles** with complete statistics
- **Transaction history** for all credit earnings
- **Cross-device synchronization**

### 🎨 **Modern UI/UX**
- **Responsive design** (mobile-first)
- **Animated backgrounds** and smooth transitions
- **Glass-morphism** design elements
- **Real-time updates** and progress visualization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (HTML/JS)     │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Authentication│    │ • REST API      │    │ • Users         │
│ • Step Tracking │    │ • JWT Auth      │    │ • Steps         │
│ • Credit System │    │ • Google OAuth  │    │ • Credits       │
│ • Profile Mgmt  │    │ • Business Logic│    │ • Achievements  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💰 Credit Algorithm

| Steps Range | Base Credits | Bonus Credits | Total Example |
|-------------|-------------|---------------|---------------|
| 100 steps   | 1 credit    | 0             | 1 credit      |
| 1,000 steps | 10 credits  | +10 bonus     | 20 credits    |
| 5,000 steps | 50 credits  | +25 bonus     | 75 credits    |
| 10,000 steps| 100 credits | +50 bonus     | 150 credits   |

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download** the project
```bash
cd "huawei comp"
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

4. **Open the app**
```bash
# The server will automatically serve the HTML files
# Open in browser:
open app-with-auth.html
# Or visit: http://localhost:3000/app-with-auth.html
```

## 🧪 Testing the Application

### **Option 1: Guest Login (Recommended)**
1. Open the app in your browser
2. Click **"Continue as Guest"**
3. You'll get a real account with database storage
4. Test all features immediately

### **Option 2: Google Login (Requires Setup)**
1. Set up Google OAuth credentials (see Configuration section)
2. Click **"Sign in with Google"**
3. Complete Google authentication

### **Core Features to Test:**

#### **Step Tracking & Conversion**
1. **Auto Steps**: Watch steps auto-generate every 5 seconds (2000-5000)
2. **Manual Steps**: Click "Generate Random Steps" for different amounts
3. **Credit Conversion**: Click "Convert Steps to Credits"
4. **Progress Bar**: Watch progress toward 10,000 step goal

#### **User Profile**
1. Navigate to **Profile** tab (👤 icon)
2. View your **total steps** and **total credits**
3. Check **achievements** (unlock by walking different amounts)
4. Test **logout** functionality

#### **Data Persistence**
1. Convert some steps to credits
2. **Close browser** completely
3. **Reopen app** - you should still be logged in
4. Your credits and data should persist

#### **Achievement System**
- Walk **100+ steps** → Unlock "First Steps" 🏃‍♂️
- Walk **1,000+ steps** → Unlock "Walker" 🚶‍♂️
- Walk **5,000+ steps** → Unlock "Stepper" 🏃‍♀️
- Walk **10,000+ steps** → Unlock "Goal Crusher" 🏆

### **API Testing (Advanced)**

Test the backend APIs directly:

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. Create Guest Account
curl -X POST http://localhost:3000/api/auth/guest \
  -H "Content-Type: application/json"

# 3. Convert Steps (requires auth token from step 2)
curl -X POST http://localhost:3000/api/credits/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"steps": 5000}'

# 4. Get User Profile
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Steps table
CREATE TABLE steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    steps INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, date)
);

-- Credits table
CREATE TABLE credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'earned' or 'spent'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Achievements table
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, achievement_type)
);
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/guest` - Create guest account

### User Management
- `GET /api/user/profile` - Get user profile with stats
- `GET /api/achievements` - Get user achievements

### Step & Credit System
- `POST /api/steps` - Submit daily steps
- `POST /api/credits/convert` - Convert steps to credits
- `GET /api/credits/balance` - Get current credit balance

### System
- `GET /health` - Server health check

## ⚙️ Configuration

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Sign-In API**
4. Create **OAuth 2.0 Client ID**
5. Add authorized domains: `http://localhost:3000`
6. Update client ID in `app-with-auth.html`:
   ```html
   data-client_id="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
   ```

### Environment Variables
Create `.env` file in backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
PORT=3000
```

## 📁 Project Structure

```
huawei comp/
├── backend/
│   ├── server-with-auth.js     # Main server with authentication
│   ├── app-with-auth.html      # Frontend application
│   ├── stepcredit.db          # SQLite database (auto-created)
│   └── package.json           # Dependencies
├── mobile-app/               # React Native (future development)
└── README.md                # This file
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password-free** - OAuth and guest accounts only
- **Token Expiry** - Automatic session management
- **Input Validation** - Server-side data validation
- **SQL Injection Protection** - Parameterized queries

## 🎯 Achievement System

| Achievement | Requirement | Icon | Description |
|-------------|------------|------|-------------|
| First Steps | 100+ steps | 🏃‍♂️ | Complete your first 100 steps |
| Walker | 1,000+ steps | 🚶‍♂️ | Walk 1,000 steps in a day |
| Stepper | 5,000+ steps | 🏃‍♀️ | Walk 5,000 steps in a day |
| Goal Crusher | 10,000+ steps | 🏆 | Reach the daily goal |

## 📱 Browser Compatibility

- ✅ **Chrome** (recommended)
- ✅ **Firefox**
- ✅ **Safari**
- ✅ **Edge**
- ✅ **Mobile browsers**

## 🐛 Troubleshooting

### Common Issues

**1. Server not starting**
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill any processes using port 3000
kill -9 PID_NUMBER
```

**2. Database errors**
```bash
# Delete and recreate database
rm backend/stepcredit.db
# Restart server - database will be recreated
```

**3. Google login not working**
- This is expected without proper OAuth setup
- Use **Guest Login** instead for full functionality

**4. Steps not updating**
- Check browser console for errors
- Verify server is running on port 3000
- Ensure you're logged in (guest or Google)

## 🚀 Future Enhancements

### Planned Features
- [ ] **Real device step tracking** (mobile sensors)
- [ ] **Rewards marketplace** (redeem credits)
- [ ] **Social features** (friends, leaderboards)
- [ ] **Mobile app** (React Native)
- [ ] **Push notifications**
- [ ] **Advanced analytics**

### Technical Improvements
- [ ] **PostgreSQL** migration for production
- [ ] **Redis** caching layer
- [ ] **Docker** containerization
- [ ] **Kubernetes** deployment
- [ ] **CI/CD** pipeline
- [ ] **Unit tests** and integration tests

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Implementing real device step tracking
- Setting up proper Google OAuth credentials
- Using a production database (PostgreSQL)
- Adding comprehensive error handling
- Implementing proper logging and monitoring

---

**🎉 Happy Walking! Turn your steps into rewards with Step Credit!**

For questions or issues, check the troubleshooting section above. 


