# EcoCredit Management Scripts

This directory contains utility scripts to manage the EcoCredit System components.

## Scripts Overview

### 🔧 `manage-backend.sh`
Manages the Java Spring Boot backend service.

**Usage:**
```bash
./scripts/manage-backend.sh {start|stop|restart|status}
```

**Commands:**
- `start` - Start the backend service on port 8080
- `stop` - Stop the backend service (kills process on port 8080)
- `restart` - Stop and start the backend service
- `status` - Check if backend is running and healthy

**Examples:**
```bash
# Start backend
./scripts/manage-backend.sh start

# Restart backend (recommended when you make changes)
./scripts/manage-backend.sh restart

# Check if backend is running
./scripts/manage-backend.sh status

# Stop backend
./scripts/manage-backend.sh stop
```

### 🌐 `start-webapp.sh`
Starts the web application server on port 8081.

**Usage:**
```bash
./scripts/start-webapp.sh
```

**What it does:**
- Serves the static web app from `backend-java/src/main/resources/static/`
- Runs on http://localhost:8081
- Auto-redirects root `/` to `/app-with-auth.html`
- Uses Node.js server (falls back to Python if Node.js not available)

### 📱 `start-mobile.sh`
Starts only the mobile app with QR code.

**Usage:**
```bash
./scripts/start-mobile.sh
```

**Features:**
- Shows QR code for device testing
- Uses tunnel mode for external network access
- Auto-installs dependencies if needed
- Clear instructions for iOS/Android testing

### 🚀 `start-fullstack.sh`
Complete full stack starter that launches backend, web app, and mobile app.

**Usage:**
```bash
./scripts/start-fullstack.sh
```

**What it does:**
1. ✅ Checks prerequisites (Java, Maven, Node.js, npm)
2. 🧹 Cleans up existing processes on ports 8080 and 8081
3. 🚀 Starts backend API on port 8080
4. 🌐 Starts web app server on port 8081
5. 📱 Starts mobile app with QR code
6. 📊 Provides status and useful links

### 🚀 `start-all.sh` (Legacy)
Original full stack starter that launches backend and mobile app only.

**Usage:**
```bash
./scripts/start-all.sh
```

**What it does:**
1. ✅ Checks prerequisites (Java, Maven, Node.js, npm)
2. 🚀 Starts/restarts the backend on port 8080
3. ⏳ Waits for backend to be healthy
4. 📱 Installs mobile app dependencies if needed
5. 🎯 Starts Expo development server
6. 📊 Provides useful URLs and tips

**Features:**
- Automatic dependency installation
- Health checks
- Clear status messages
- Helpful tips and URLs

## Quick Start

### For Full Development (Recommended)
```bash
# Start everything: Backend + Web App + Mobile App
./scripts/start-fullstack.sh
```

### For Individual Components
```bash
# Backend only
./scripts/manage-backend.sh restart

# Web app only (requires backend running)
./scripts/start-webapp.sh

# Mobile app only (requires backend running)
./scripts/start-mobile.sh
```

### Legacy Options
```bash
# Backend + Mobile App only (no web app)
./scripts/start-all.sh
```

## Port Information

- **Backend API**: http://localhost:8080
- **Web App**: http://localhost:8081
- **Mobile App (Expo)**: Port assigned automatically (usually 8082+)
- **Health Check**: http://localhost:8080/api/health
- **Direct Web App**: http://localhost:8081/app-with-auth.html

## Troubleshooting

### Port Conflicts
If you get port conflicts:
```bash
# Kill processes on port 8080
./scripts/manage-backend.sh stop

# Or manually kill specific port
lsof -ti:8080 | xargs kill -9
```

### Backend Not Starting
1. Check Java version: `java -version` (need Java 17+)
2. Check Maven: `mvn -version`
3. Build manually:
   ```bash
   cd backend-java
   mvn clean package -DskipTests
   ```

### Mobile App Issues
1. Clear Expo cache:
   ```bash
   cd mobile-app
   npx expo start --clear
   ```
2. Reinstall dependencies:
   ```bash
   cd mobile-app
   rm -rf node_modules
   npm install
   ```

### Network Connection Issues
1. Check backend health: `curl http://localhost:8080/api/health`
2. Check if backend is running: `./scripts/manage-backend.sh status`
3. Restart everything: `./scripts/start-all.sh`

## Development Workflow

### Making Backend Changes
```bash
# 1. Make your changes
# 2. Restart backend
./scripts/manage-backend.sh restart
```

### Making Mobile App Changes
The mobile app will auto-reload when you save files. No restart needed.

### Full System Restart
```bash
# Stop everything
./scripts/manage-backend.sh stop
# Ctrl+C to stop mobile app

# Start everything fresh
./scripts/start-all.sh
```

## Environment Configuration

The scripts use these default configurations:
- Backend port: 8080
- Backend JAR: `backend-java/target/ecocredit-backend-1.0.0.jar`
- Mobile app directory: `mobile-app/`

To modify these, edit the scripts directly or create environment variables.

## Dependencies

### Backend
- Java 17 or higher
- Maven 3.6+
- Spring Boot 3.2.0

### Mobile App
- Node.js 16+
- npm or yarn
- Expo CLI
- React Native dependencies

## Support

If you encounter issues:
1. Check this README
2. Run `./scripts/manage-backend.sh status`
3. Check the logs in terminal
4. Restart with `./scripts/start-all.sh` 