# 🔐 Google OAuth 2.0 Setup Guide

## Prerequisites
- Google account
- Domain name (for production)

## Step-by-Step Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `EcoCredit System`
4. Click "Create"

### 2. Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - **Google+ API**
   - **Google Identity API**
   - **Google Sign-In API**

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: **Web application**
4. Name: `EcoCredit Web App`

### 4. Configure Authorized Origins
Add these URLs:
```
http://localhost:3000          # Development
https://yourdomain.com         # Production
https://www.yourdomain.com     # Production with www
```

### 5. Configure Authorized Redirect URIs
Add these URLs:
```
http://localhost:3000/auth/google/callback
https://yourdomain.com/auth/google/callback
```

### 6. Get Your Credentials
- **Client ID**: `your-client-id.apps.googleusercontent.com`
- **Client Secret**: `your-client-secret`

### 7. Update Environment Variables
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Security Best Practices
- Never commit credentials to Git
- Use environment variables
- Enable HTTPS in production
- Set up proper CORS policies 