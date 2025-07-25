# ☁️ Huawei Cloud Setup Guide

## Prerequisites
- Huawei Cloud account
- Credit card for billing
- Domain name (for production)

## Step-by-Step Setup

### 1. Create Huawei Cloud Account
1. Go to [Huawei Cloud](https://www.huaweicloud.com/)
2. Click "Sign Up" and create account
3. Complete identity verification
4. Add payment method

### 2. Create Project
1. Go to [Huawei Cloud Console](https://console.huaweicloud.com/)
2. Click "Create Project"
3. Name: `EcoCredit System`
4. Select region: `Asia Pacific - Hong Kong` (or nearest to you)

### 3. Enable Required Services

#### **ECS (Elastic Cloud Server)**
1. Go to "Elastic Cloud Server"
2. Click "Create ECS"
3. Configuration:
   - **Region**: Asia Pacific - Hong Kong
   - **AZ**: Auto-select
   - **Specifications**: 2 vCPUs, 4GB RAM (minimum)
   - **Image**: Ubuntu 20.04 LTS
   - **System Disk**: 40GB
   - **Bandwidth**: 5Mbps
   - **Security Group**: Create new (allow ports 22, 80, 443, 3000)

#### **RDS (Relational Database Service)**
1. Go to "RDS"
2. Click "Create DB Instance"
3. Configuration:
   - **Engine**: MySQL 8.0
   - **Specifications**: 2 vCPUs, 4GB RAM
   - **Storage**: 100GB
   - **Network**: Same VPC as ECS
   - **Security Group**: Allow port 3306

#### **OBS (Object Storage Service)**
1. Go to "Object Storage Service"
2. Click "Create Bucket"
3. Configuration:
   - **Region**: Same as ECS
   - **Data Redundancy**: Standard
   - **Access Control**: Private

#### **SMS (Short Message Service)**
1. Go to "SMS"
2. Apply for SMS service
3. Get API credentials

#### **Push Kit (Push Notification)**
1. Go to "Push Kit"
2. Create application
3. Get App ID and App Secret

### 4. Get Access Credentials
1. Go to "My Credentials"
2. Create Access Key ID and Secret Access Key
3. Download credentials file

### 5. Update Environment Variables
```env
# Huawei Cloud Configuration
HUAWEI_ACCESS_KEY_ID=your-access-key-id
HUAWEI_SECRET_ACCESS_KEY=your-secret-access-key
HUAWEI_REGION=ap-southeast-1
HUAWEI_PROJECT_ID=your-project-id

# ECS Configuration
ECS_INSTANCE_ID=your-ecs-instance-id
ECS_PUBLIC_IP=your-ecs-public-ip

# RDS Configuration
RDS_ENDPOINT=your-rds-endpoint
RDS_USERNAME=your-rds-username
RDS_PASSWORD=your-rds-password
RDS_DATABASE=ecocredit

# OBS Configuration
OBS_BUCKET_NAME=your-obs-bucket-name
OBS_ENDPOINT=your-obs-endpoint

# SMS Configuration
SMS_APP_ID=your-sms-app-id
SMS_APP_KEY=your-sms-app-key
SMS_SIGNATURE=your-sms-signature

# Push Kit Configuration
PUSH_APP_ID=your-push-app-id
PUSH_APP_SECRET=your-push-app-secret
```

## Estimated Monthly Costs
- **ECS**: ~$30-50/month
- **RDS**: ~$20-40/month
- **OBS**: ~$5-10/month (depending on usage)
- **SMS**: Pay per message (~$0.01/message)
- **Push Kit**: Free tier available

## Security Best Practices
- Use IAM roles and policies
- Enable VPC and security groups
- Use HTTPS for all communications
- Regularly rotate access keys
- Enable CloudTrail for audit logs 