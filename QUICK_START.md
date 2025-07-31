# 🌱 EcoCredit System - Quick Start Guide

## Overview

The EcoCredit System is a comprehensive platform that includes:
- **Backend API** (Java Spring Boot) - Port 8080
- **Web Application** (HTML/JS) - Port 8081  
- **Mobile Application** (React Native/Expo) - QR Code Access

## 🚀 One-Command Startup

```bash
# Start everything (Backend + Web App + Mobile App) - RECOMMENDED
./scripts/start-all-clean.sh
```

**Alternative:**
```bash
# Original full stack starter
./scripts/start-fullstack.sh
```

This will:
1. ✅ Check prerequisites
2. 🧹 Clean up existing processes
3. 🚀 Start backend API on port 8080
4. 🌐 Start web app on port 8081
5. 📱 Start mobile app with QR code

## 🔗 Access Points

After running the startup script:

### Web Application
- **URL**: http://localhost:8081
- **Direct Link**: http://localhost:8081/app-with-auth.html
- **Features**: Full web interface with authentication

### Mobile Application  
- **Access**: Scan QR code with Expo Go app
- **Features**: Native mobile experience
- **Testing**: Use iOS Simulator ('i') or Android Emulator ('a')

### Backend API
- **Health Check**: http://localhost:8080/api/health
- **Database Console**: http://localhost:8080/h2-console
- **API Documentation**: Available via endpoints

## 📱 Mobile App Setup

### Prerequisites
1. Install Expo Go app on your phone:
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Testing Options
```bash
# Mobile app only (requires backend running)
./scripts/start-mobile.sh

# Then:
# - Scan QR code with Expo Go
# - Press 'i' for iOS Simulator  
# - Press 'a' for Android Emulator
# - Press 'w' for web browser
```

## 🔧 Individual Services

### Backend Only
```bash
./scripts/manage-backend.sh restart
```

### Web App Only  
```bash
./scripts/start-webapp.sh
```

### Mobile App Only
```bash
./scripts/start-mobile.sh
```

## 🛠 Development Workflow

### Making Changes

**Backend Changes:**
```bash
# 1. Make your changes in backend-java/
# 2. Restart backend
./scripts/manage-backend.sh restart
```

**Web App Changes:**
- Edit files in `backend-java/src/main/resources/static/`
- Changes are immediate (refresh browser)

**Mobile App Changes:**  
- Edit files in `mobile-app/src/`
- Changes auto-reload on save

### Port Management

The system uses these ports:
- **8080**: Backend API
- **8081**: Web Application  
- **8082+**: Mobile App (auto-assigned)

If you encounter port conflicts:
```bash
# Kill specific port
lsof -ti:8080 | xargs kill -9

# Or use management script
./scripts/manage-backend.sh stop
```

## 📊 System Status

Check if everything is running:

```bash
# Backend status
./scripts/manage-backend.sh status

# Quick verification
curl http://localhost:8080/api/health
curl http://localhost:8081
```

## 🎯 Features

### Web Application
- ✅ User authentication (Google OAuth + Guest)
- ✅ Step tracking and credit conversion
- ✅ Rewards browsing and redemption
- ✅ Achievement system
- ✅ Real-time data sync

### Mobile Application
- ✅ Native mobile experience
- ✅ QR code access for easy testing
- ✅ Same features as web app
- ✅ Offline mode indicators
- ✅ Responsive design

### Backend API
- ✅ RESTful API with 16 sample rewards
- ✅ User management and authentication
- ✅ Credit system with step conversion
- ✅ Achievement tracking
- ✅ Voucher generation and management

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Java version (need 17+)
java -version

# Rebuild if needed  
cd backend-java
mvn clean package -DskipTests
cd ..
./scripts/manage-backend.sh restart
```

**Web app not accessible:**
```bash
# Check if Node.js is installed
node -v

# Restart web server
./scripts/start-webapp.sh
```

**Mobile app no QR code:**
```bash
# Use tunnel mode
cd mobile-app
npx expo start --tunnel --clear
```

**Port conflicts:**
```bash
# Clean up all ports
./scripts/manage-backend.sh stop
lsof -ti:8081 | xargs kill -9

# Start fresh
./scripts/start-fullstack.sh
```

### Network Issues

If mobile app can't connect to backend:
1. Ensure backend is running: `curl http://localhost:8080/api/health`
2. Check mobile app shows "Offline Mode" indicator
3. Both devices must be on same network (or use tunnel mode)

## 📝 Development Tips

1. **Use tunnel mode** for mobile testing across networks
2. **Web app** perfect for quick development and testing
3. **Both apps share the same backend** - changes reflect everywhere
4. **Sample data** includes 16 rewards across 6 partner stores
5. **Guest authentication** allows immediate testing

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Backend health check returns JSON response
- ✅ Web app loads at http://localhost:8081
- ✅ Mobile app shows QR code  
- ✅ Both apps can authenticate and show rewards

## 📞 Quick Commands Reference

```bash
# Full stack startup
./scripts/start-fullstack.sh

# Individual services
./scripts/manage-backend.sh restart
./scripts/start-webapp.sh  
./scripts/start-mobile.sh

# Status checks
./scripts/manage-backend.sh status
curl http://localhost:8080/api/health
curl http://localhost:8081

# Cleanup
./scripts/manage-backend.sh stop
```

---

**Happy coding! 🌱 Let's build a greener future together!** 