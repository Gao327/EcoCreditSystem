# 🚀 Production Deployment & Release Guide

## Prerequisites
- All previous setup completed (Google OAuth, Huawei Cloud, Step Tracking)
- Domain name with SSL certificate
- CI/CD pipeline setup
- Monitoring and logging tools

## Step-by-Step Setup

### 1. Production Environment Setup

#### **Domain & SSL Setup**
1. Purchase domain (e.g., `ecocredit.com`)
2. Configure DNS to point to Huawei Cloud ECS
3. Install SSL certificate (Let's Encrypt or paid)
4. Set up HTTPS redirect

#### **Environment Configuration**
Create `.env.production`:
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DB_HOST=your-rds-endpoint
DB_USER=your-rds-username
DB_PASSWORD=your-rds-password
DB_NAME=ecocredit
DB_PORT=3306

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret

# Huawei Cloud
HUAWEI_ACCESS_KEY_ID=your-access-key
HUAWEI_SECRET_ACCESS_KEY=your-secret-key
HUAWEI_REGION=ap-southeast-1

# File Storage
OBS_BUCKET_NAME=ecocredit-prod
OBS_ENDPOINT=your-obs-endpoint

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 2. Database Migration

#### **Create Production Database**
```sql
-- Connect to RDS MySQL
mysql -h your-rds-endpoint -u your-username -p

-- Create database
CREATE DATABASE ecocredit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with limited permissions
CREATE USER 'ecocredit_app'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ecocredit.* TO 'ecocredit_app'@'%';
FLUSH PRIVILEGES;
```

#### **Run Migrations**
```bash
# Install migration tool
npm install -g sequelize-cli

# Create migration files
npx sequelize-cli migration:generate --name create-users-table
npx sequelize-cli migration:generate --name create-steps-table
npx sequelize-cli migration:generate --name create-credits-table
npx sequelize-cli migration:generate --name create-achievements-table

# Run migrations
npx sequelize-cli db:migrate
```

### 3. Server Deployment

#### **ECS Server Setup**
```bash
# Connect to ECS instance
ssh ubuntu@your-ecs-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### **Application Deployment**
```bash
# Clone repository
git clone https://github.com/Gao327/EcoCreditSystem.git
cd EcoCreditSystem

# Install dependencies
npm install --production

# Build frontend (if using build tools)
npm run build

# Start with PM2
pm2 start backend/server-with-auth.js --name "ecocredit-api"
pm2 startup
pm2 save
```

#### **Nginx Configuration**
Create `/etc/nginx/sites-available/ecocredit`:
```nginx
server {
    listen 80;
    server_name ecocredit.com www.ecocredit.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ecocredit.com www.ecocredit.com;

    ssl_certificate /etc/letsencrypt/live/ecocredit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ecocredit.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        root /var/www/ecocredit;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Mobile App Release

#### **iOS App Store Release**

**1. Apple Developer Account Setup**
- Enroll in Apple Developer Program ($99/year)
- Create App ID in Developer Console
- Configure capabilities (HealthKit, Push Notifications)

**2. App Store Connect Setup**
- Create new app in App Store Connect
- Fill app metadata (description, screenshots, keywords)
- Set up app review information

**3. Build & Upload**
```bash
# Install fastlane
gem install fastlane

# Initialize fastlane
cd ios && fastlane init

# Create Fastfile
fastlane beta
fastlane release
```

**4. App Store Review Process**
- Submit for review (1-7 days)
- Address any review feedback
- Release to App Store

#### **Android Google Play Release**

**1. Google Play Console Setup**
- Create developer account ($25 one-time fee)
- Create new app in Play Console
- Fill app metadata and store listing

**2. Build & Upload**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Upload to Play Console
# Or use fastlane
fastlane android beta
fastlane android release
```

**3. Play Store Review Process**
- Submit for review (1-3 days)
- Address any review feedback
- Release to Play Store

### 5. CI/CD Pipeline

#### **GitHub Actions Setup**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Huawei Cloud
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/ecocredit
          git pull origin main
          npm install --production
          pm2 restart ecocredit-api
```

### 6. Monitoring & Analytics

#### **Application Monitoring**
```bash
# Install monitoring tools
npm install --save @sentry/node
npm install --save winston
npm install --save express-rate-limit

# Configure Sentry
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

#### **Server Monitoring**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Set up log rotation
sudo logrotate -f /etc/logrotate.conf

# Monitor with PM2
pm2 monit
pm2 logs ecocredit-api
```

### 7. Security Hardening

#### **Server Security**
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### **Application Security**
- Implement rate limiting
- Add input validation
- Use HTTPS everywhere
- Implement proper CORS
- Add security headers
- Regular security updates

### 8. Backup Strategy

#### **Database Backups**
```bash
# Create backup script
#!/bin/bash
mysqldump -h your-rds-endpoint -u your-username -p ecocredit > backup_$(date +%Y%m%d_%H%M%S).sql

# Set up automated backups
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

#### **File Backups**
- Configure OBS bucket versioning
- Set up cross-region replication
- Regular backup testing

## Estimated Timeline
- **Environment Setup**: 1-2 days
- **Database Migration**: 1 day
- **Server Deployment**: 1-2 days
- **Mobile App Release**: 2-4 weeks
- **CI/CD Setup**: 1-2 days
- **Monitoring Setup**: 1 day
- **Security Hardening**: 1-2 days
- **Total**: 3-6 weeks

## Estimated Monthly Costs
- **ECS Server**: $30-50
- **RDS Database**: $20-40
- **OBS Storage**: $5-10
- **Domain & SSL**: $10-20
- **Monitoring Tools**: $10-30
- **Total**: $75-150/month 