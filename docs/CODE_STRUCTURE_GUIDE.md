# 📁 Code Structure Guide - What Each Part Does

## 🏗️ **Current System Architecture**

```
huawei comp/
├── backend/                    # Backend server code
│   ├── server-with-auth.js    # Main server file (Node.js)
│   ├── app-with-auth.html     # Frontend web app (HTML/CSS/JS)
│   ├── package.json           # Node.js dependencies
│   ├── stepcredit.db          # SQLite database file
│   └── tsconfig.json          # TypeScript configuration
├── mobile-app/                # React Native mobile app
├── docs/                      # Documentation
└── README.md                  # Project overview
```

## 🔧 **Backend Code Breakdown**

### **1. Main Server File: `backend/server-with-auth.js`**

#### **What it does:**
- **Starts the web server** on port 3000
- **Handles all API requests** (login, steps, credits, etc.)
- **Manages database** (SQLite)
- **Handles authentication** (Google OAuth, JWT tokens)

#### **Key sections:**

```javascript
// 1. IMPORTS & SETUP
const express = require('express');           // Web framework
const cors = require('cors');                 // Allow cross-origin requests
const sqlite3 = require('sqlite3');           // Database
const jwt = require('jsonwebtoken');          // Authentication tokens
const { OAuth2Client } = require('google-auth-library'); // Google login

// 2. DATABASE SETUP
const db = new sqlite3.Database('./stepcredit.db');  // Connect to SQLite
function initializeDatabase() {               // Create tables if they don't exist
  // Creates: users, steps, credits, achievements tables
}

// 3. AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {  // Check if user is logged in
  // Verifies JWT token from request headers
}

// 4. API ROUTES
app.get('/health', ...)                       // Server health check
app.post('/api/auth/google', ...)             // Google OAuth login
app.post('/api/auth/guest', ...)              // Guest login
app.post('/api/steps', ...)                   // Submit step data
app.post('/api/credits/convert', ...)         // Convert steps to credits
app.get('/api/credits/balance', ...)          // Get user's credit balance
app.get('/api/user/profile', ...)             // Get user profile
app.get('/api/achievements', ...)             // Get user achievements

// 5. BUSINESS LOGIC
function calculateEcoCredits(steps) {         // Step-to-credit conversion algorithm
  // 1 credit per 100 steps + bonus credits for milestones
}

function checkAchievements(userId, steps, credits) {  // Unlock achievements
  // Checks if user qualifies for new achievements
}
```

#### **What you can change:**
- **Credit calculation algorithm** in `calculateEcoCredits()`
- **Achievement criteria** in `checkAchievements()`
- **API endpoints** and their responses
- **Database schema** in `initializeDatabase()`

### **2. Frontend File: `backend/app-with-auth.html`**

#### **What it does:**
- **User interface** (login, dashboard, profile)
- **Makes API calls** to the backend
- **Handles user interactions** (buttons, forms)
- **Displays data** (steps, credits, achievements)

#### **Key sections:**

```html
<!-- 1. HTML STRUCTURE -->
<div id="loginPage">     <!-- Login screen -->
<div id="homePage">      <!-- Main dashboard -->
<div id="profilePage">   <!-- User profile -->

<!-- 2. CSS STYLING -->
<style>
  /* All the visual styling */
  /* Colors, fonts, layouts, animations */
</style>

<!-- 3. JAVASCRIPT FUNCTIONALITY -->
<script>
  // 4. APP STATE
  let currentUser = null;      // Currently logged in user
  let authToken = null;        // Authentication token
  let currentSteps = 0;        // Current step count
  let currentCredits = 0;      // Current credit balance

  // 5. API FUNCTIONS
  async function apiCall(endpoint, method, data) {  // Make HTTP requests to backend
  async function signInAsGuest() {                  // Guest login
  async function handleGoogleSignIn(credential) {   // Google login
  async function convertSteps() {                   // Convert steps to credits
  async function generateSteps() {                  // Generate random steps
  async function loadProfileData() {                // Load user profile

  // 6. UI FUNCTIONS
  function showPage(pageName) {                     // Switch between pages
  function updateDisplay() {                        // Update UI with new data
  function showStatus(message, type) {              // Show success/error messages
  function displayAchievements(achievements) {      // Show achievement badges
</script>
```

#### **What you can change:**
- **Visual design** (colors, fonts, layout) in the `<style>` section
- **User interface** (buttons, forms, cards) in the HTML
- **User interactions** (what happens when buttons are clicked)
- **Data display** (how information is shown to users)

### **3. Database File: `backend/stepcredit.db`**

#### **What it does:**
- **Stores all user data** (SQLite database file)
- **Persistent storage** (data survives server restarts)

#### **Database Tables:**
```sql
-- USERS TABLE: Store user information
CREATE TABLE users (
  id INTEGER PRIMARY KEY,           -- Unique user ID
  google_id TEXT UNIQUE,            -- Google account ID
  email TEXT,                       -- User's email
  name TEXT,                        -- User's name
  avatar_url TEXT,                  -- Profile picture
  created_at DATETIME               -- When account was created
);

-- STEPS TABLE: Store daily step counts
CREATE TABLE steps (
  id INTEGER PRIMARY KEY,           -- Unique step record ID
  user_id INTEGER,                  -- Which user this belongs to
  steps INTEGER,                    -- Number of steps
  date DATE,                        -- Date of steps
  created_at DATETIME               -- When recorded
);

-- CREDITS TABLE: Store credit transactions
CREATE TABLE credits (
  id INTEGER PRIMARY KEY,           -- Unique credit record ID
  user_id INTEGER,                  -- Which user this belongs to
  amount INTEGER,                   -- Number of credits
  source TEXT,                      -- How credits were earned
  created_at DATETIME               -- When earned
);

-- ACHIEVEMENTS TABLE: Store unlocked achievements
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY,           -- Unique achievement record ID
  user_id INTEGER,                  -- Which user this belongs to
  type TEXT,                        -- Achievement type
  title TEXT,                       -- Achievement name
  description TEXT,                 -- Achievement description
  earned_at DATETIME                -- When unlocked
);
```

#### **What you can change:**
- **Add new tables** for additional features
- **Modify table structure** (add/remove columns)
- **Change data types** (e.g., store more user info)

## 🍃 **Java Backend Alternative**

If you want to use Java instead of Node.js, here's what you'd need:

### **Spring Boot Structure:**
```
backend-java/
├── src/main/java/com/ecocredit/
│   ├── EcoCreditApplication.java      # Main application class
│   ├── controllers/                   # API endpoints (like routes in Node.js)
│   │   ├── AuthController.java        # Login/logout endpoints
│   │   ├── StepsController.java       # Step tracking endpoints
│   │   ├── CreditsController.java     # Credit management endpoints
│   │   └── UserController.java        # User profile endpoints
│   ├── services/                      # Business logic (like functions in Node.js)
│   │   ├── AuthService.java           # Authentication logic
│   │   ├── StepService.java           # Step calculation logic
│   │   ├── CreditService.java         # Credit conversion logic
│   │   └── AchievementService.java    # Achievement checking logic
│   ├── models/                        # Database entities
│   │   ├── User.java                  # User entity
│   │   ├── Step.java                  # Step entity
│   │   ├── Credit.java                # Credit entity
│   │   └── Achievement.java           # Achievement entity
│   ├── repositories/                  # Database access
│   │   ├── UserRepository.java        # User database operations
│   │   ├── StepRepository.java        # Step database operations
│   │   ├── CreditRepository.java      # Credit database operations
│   │   └── AchievementRepository.java # Achievement database operations
│   └── config/                        # Configuration
│       ├── SecurityConfig.java        # Security settings
│       └── DatabaseConfig.java        # Database settings
├── src/main/resources/
│   ├── application.properties         # Configuration file
│   └── static/                        # Frontend files (HTML/CSS/JS)
└── pom.xml                           # Maven dependencies
```

### **Equivalent Java Code:**

#### **Node.js Route → Java Controller:**
```javascript
// Node.js (server-with-auth.js)
app.post('/api/steps', authenticateToken, (req, res) => {
  const { steps } = req.body;
  const userId = req.user.userId;
  // ... save steps to database
});
```

```java
// Java (StepsController.java)
@RestController
@RequestMapping("/api")
public class StepsController {
    
    @PostMapping("/steps")
    public ResponseEntity<?> submitSteps(@RequestBody StepRequest request, 
                                       @AuthenticationPrincipal User user) {
        // ... save steps to database
        return ResponseEntity.ok(result);
    }
}
```

#### **Node.js Function → Java Service:**
```javascript
// Node.js (server-with-auth.js)
function calculateEcoCredits(steps) {
  const baseCredits = Math.floor(steps / 100);
  let bonusCredits = 0;
  if (steps >= 10000) bonusCredits = 50;
  // ...
}
```

```java
// Java (CreditService.java)
@Service
public class CreditService {
    
    public CreditCalculation calculateEcoCredits(int steps) {
        int baseCredits = steps / 100;
        int bonusCredits = 0;
        if (steps >= 10000) bonusCredits = 50;
        // ...
        return new CreditCalculation(baseCredits, bonusCredits);
    }
}
```

## 🎯 **What You Can Change Yourself**

### **Easy Changes (No Programming Experience Needed):**

#### **1. Visual Design (Frontend)**
- **Colors**: Change in `app-with-auth.html` `<style>` section
- **Text**: Change labels, messages, titles in HTML
- **Images**: Replace placeholder images
- **Layout**: Adjust spacing, sizes, positions

#### **2. Business Rules (Backend)**
- **Credit calculation**: Modify `calculateEcoCredits()` function
- **Achievement criteria**: Change conditions in `checkAchievements()`
- **Step goals**: Change the 10,000 step target
- **Bonus amounts**: Adjust credit bonuses

#### **3. Database (Structure)**
- **Add new fields**: Modify table creation in `initializeDatabase()`
- **Change data types**: Update column definitions
- **Add new tables**: Create new tables for features

### **Medium Changes (Basic Programming):**

#### **1. New API Endpoints**
- **Add new routes**: Create new `app.post()` or `app.get()` in server file
- **New functionality**: Add new functions for features
- **Data validation**: Add input checking

#### **2. Frontend Features**
- **New pages**: Add new HTML sections
- **New buttons**: Add new interactive elements
- **Data display**: Show new information

### **Advanced Changes (Programming Experience):**

#### **1. Switch to Java Backend**
- **Create Spring Boot project**
- **Convert Node.js routes to Java controllers**
- **Convert JavaScript functions to Java services**
- **Set up MySQL/PostgreSQL instead of SQLite**

#### **2. Modern Frontend**
- **Convert to React + TypeScript**
- **Add state management (Redux/Zustand)**
- **Implement real-time updates**
- **Add offline functionality**

## 🚀 **Recommended Learning Path**

### **Start Here (No Programming):**
1. **Change colors and text** in `app-with-auth.html`
2. **Modify credit calculation** in `server-with-auth.js`
3. **Add new achievement criteria**

### **Next Level (Basic Programming):**
1. **Learn JavaScript basics**
2. **Add new API endpoints**
3. **Create new frontend features**

### **Advanced Level (Programming Experience):**
1. **Learn Java and Spring Boot**
2. **Convert entire backend to Java**
3. **Learn React and TypeScript**
4. **Create modern frontend**

## 📚 **Resources for Learning**

### **JavaScript (Current System):**
- **MDN Web Docs**: JavaScript basics
- **Node.js Documentation**: Server development
- **Express.js Guide**: Web framework

### **Java (Alternative Backend):**
- **Spring Boot Documentation**: Official guide
- **Baeldung**: Spring tutorials
- **Java Tutorials**: Oracle official guide

### **Frontend (Modern):**
- **React Documentation**: Official guide
- **TypeScript Handbook**: Type safety
- **Tailwind CSS**: Utility-first CSS

**Would you like me to help you make specific changes to the current system, or would you prefer to start learning Java for the backend?** 🎯 