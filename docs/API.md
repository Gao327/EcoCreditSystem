# Step Credit MVP - API Documentation

## Overview

The Step Credit MVP uses a microservices architecture with the following components:

- **API Gateway** (Port 3000) - Main entry point that routes requests
- **Step Tracker Service** (Port 3001) - Handles step data tracking
- **Credit System Service** (Port 3002) - Manages credit conversion and achievements
- **Payment Service** (Port 3003) - Handles rewards and redemptions

All endpoints return responses in the following format:

```json
{
  "success": boolean,
  "data": any,
  "error": {
    "code": string,
    "message": string,
    "timestamp": string
  },
  "metadata": {
    "page": number,
    "limit": number,
    "total": number
  }
}
```

## Base URL

All API calls go through the Gateway:
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

---

## Step Tracking API

### Submit Step Data

**POST** `/api/steps`

Submit daily step data from mobile device.

**Request Body:**
```json
{
  "userId": "user123",
  "steps": 8500,
  "date": "2024-01-15T10:30:00Z",
  "distance": 6800,
  "calories": 340,
  "activeMinutes": 85,
  "deviceInfo": {
    "deviceId": "device123",
    "platform": "ios",
    "model": "iPhone 14",
    "osVersion": "17.1",
    "appVersion": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "step_data_id",
    "userId": "user123",
    "steps": 8500,
    "distance": 6800,
    "calories": 340,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get User Step Data

**GET** `/api/steps/{userId}`

Retrieve user's step history.

**Query Parameters:**
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter  
- `limit` (optional): Number of records (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "step_data_id",
      "userId": "user123",
      "steps": 8500,
      "date": "2024-01-15T10:30:00Z",
      "distance": 6800,
      "calories": 340
    }
  ],
  "metadata": {
    "total": 15,
    "limit": 30
  }
}
```

### Get Daily Summary

**GET** `/api/steps/{userId}/daily`

Get today's step summary for a user.

**Query Parameters:**
- `date` (optional): Specific date (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "steps": 8500,
    "distance": 6800,
    "calories": 340,
    "activeMinutes": 85,
    "date": "2024-01-15T00:00:00Z"
  }
}
```

### Get Weekly Summary

**GET** `/api/steps/{userId}/weekly`

Get weekly step summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "weeklyTotal": {
      "steps": 58500,
      "distance": 46800,
      "calories": 2340,
      "activeMinutes": 580
    },
    "dailyData": [
      {
        "steps": 8500,
        "date": "2024-01-15T00:00:00Z"
      }
    ],
    "weekStart": "2024-01-14T00:00:00Z",
    "weekEnd": "2024-01-20T23:59:59Z"
  }
}
```

### Get User Statistics

**GET** `/api/steps/{userId}/stats`

Get comprehensive user statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSteps": 285000,
    "totalDistance": 228000,
    "totalCalories": 11400,
    "avgSteps": 9500,
    "maxSteps": 15000,
    "daysTracked": 30,
    "recentActivity": [...]
  }
}
```

---

## Credit System API

### Convert Steps to Credits

**POST** `/api/credits/convert-steps`

Convert user's steps to credits.

**Request Body:**
```json
{
  "userId": "user123",
  "steps": 8500,
  "date": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "creditsEarned": 135,
    "baseCredits": 85,
    "bonusCredits": 50,
    "balance": {
      "userId": "user123",
      "totalCredits": 2150,
      "availableCredits": 2000,
      "lifetimeEarned": 2150,
      "lifetimeSpent": 150
    },
    "transaction": {
      "id": "tx_123",
      "type": "earned",
      "amount": 85,
      "source": "daily_steps"
    }
  }
}
```

### Get Credit Balance

**GET** `/api/credits/{userId}/balance`

Get user's current credit balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalCredits": 2150,
    "availableCredits": 2000,
    "pendingCredits": 0,
    "lifetimeEarned": 2150,
    "lifetimeSpent": 150,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Get Transaction History

**GET** `/api/credits/{userId}/transactions`

Get user's credit transaction history.

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by transaction type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx_123",
      "userId": "user123",
      "type": "earned",
      "amount": 85,
      "source": "daily_steps",
      "description": "Earned 85 credits for 8500 steps",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasNextPage": false
  }
}
```

### Spend Credits

**POST** `/api/credits/{userId}/spend`

Spend credits on rewards.

**Request Body:**
```json
{
  "amount": 100,
  "description": "Coffee reward redemption",
  "rewardId": "reward_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx_124",
      "type": "spent",
      "amount": 100,
      "source": "reward_redemption"
    },
    "updatedBalance": {
      "availableCredits": 1900,
      "lifetimeSpent": 250
    }
  }
}
```

---

## Achievements API

### Get User Achievements

**GET** `/api/achievements/{userId}`

Get user's achievement progress.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_achievement_123",
      "userId": "user123",
      "achievementId": "first_steps",
      "progress": 100,
      "isCompleted": true,
      "completedAt": "2024-01-10T10:30:00Z",
      "achievement": {
        "id": "first_steps",
        "name": "First Steps",
        "description": "Take your first 1,000 steps",
        "reward": {
          "credits": 10,
          "badges": ["first_steps"]
        }
      }
    }
  ]
}
```

---

## Rewards API

### Get Available Rewards

**GET** `/api/rewards`

Get list of available rewards.

**Query Parameters:**
- `category` (optional): Filter by reward category
- `limit` (optional): Number of records

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reward_123",
      "name": "Coffee Voucher",
      "description": "Get a free coffee at partner cafes",
      "cost": 100,
      "category": "food_beverage",
      "type": "digital_coupon",
      "availability": {
        "quantity": 50,
        "userLimit": 1
      },
      "metadata": {
        "images": ["coffee_voucher.jpg"],
        "vendor": {
          "name": "Coffee Partners",
          "logo": "coffee_logo.png"
        }
      }
    }
  ]
}
```

### Redeem Reward

**POST** `/api/rewards/redeem`

Redeem a reward using credits.

**Request Body:**
```json
{
  "userId": "user123",
  "rewardId": "reward_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "redemption": {
      "id": "redemption_123",
      "userId": "user123",
      "rewardId": "reward_123",
      "cost": 100,
      "status": "pending",
      "redeemedAt": "2024-01-15T10:30:00Z"
    },
    "digitalCode": "COFFEE2024ABC123",
    "instructions": "Show this code at any partner cafe to redeem your free coffee."
  }
}
```

---

## Health Check Endpoints

### Gateway Health

**GET** `/health`

Check API Gateway health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": ["stepTracker", "creditSystem", "payment"],
    "version": "1.0.0"
  }
}
```

### Service Status

**GET** `/status`

Check all services health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "gateway": "healthy",
    "services": {
      "stepTracker": true,
      "creditSystem": true,
      "payment": true,
      "user": true
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Error Codes

Common error codes returned by the API:

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INSUFFICIENT_CREDITS` - Not enough credits for operation
- `SERVICE_UNAVAILABLE` - Microservice temporarily unavailable
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Higher limits available for authenticated users
- Exceeded limits return `429 Too Many Requests`

---

## Authentication

Most endpoints require user authentication via JWT token:

```
Authorization: Bearer <jwt_token>
```

Authentication endpoints (to be implemented):
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`

---

## Pagination

List endpoints support pagination:

- `limit`: Number of items per page (max 100)
- `offset`: Number of items to skip
- `page`: Page number (alternative to offset)

Responses include metadata:
```json
{
  "metadata": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
``` 