
# 🌱 EcoCredit System - Green Living Promotion Platform

A comprehensive platform that promotes sustainable living through gamification, starting with step tracking and eco-credit conversion.

## 🎯 **Project Overview**

EcoCredit is a green living promotion system that encourages users to adopt sustainable habits. The system tracks user activities (starting with sustainable transportation steps) and converts them into eco-credits, which can be used for various green initiatives and rewards.

### **🌍 Environmental Impact**
- **Step Tracking**: Encourages walking and cycling (reducing carbon footprint)
- **Eco-Credits**: Gamified rewards for sustainable behavior
- **Achievement System**: Motivates continued participation in green activities
- **Future Features**: Recycling tracking, energy conservation, sustainable shopping

## 🏗️ **Architecture**

### **Backend: Java Spring Boot**
- **Framework**: Spring Boot 3.2.0 with Java 17
- **Database**: H2 (development) / MySQL (production)
- **Port**: 8081 (configurable)
- **Features**: RESTful APIs, JWT authentication, achievement system

### **Frontend: Web Interface**
- **Technology**: HTML/CSS/JavaScript
- **Features**: Step tracking, credit conversion, achievement display
- **Access**: Browser-based interface

## 🚀 **Quick Start**

### **Prerequisites**
- Java 17 or higher
- Maven 3.6+
- Git

### **1. Clone and Setup**
```bash
git clone <your-repo-url>
cd "huawei comp"
```

### **2. Start the Java Backend**
```bash
cd backend-java
mvn spring-boot:run
```

The application will start on **http://localhost:8081**

### **3. Test the API**
```bash
# Health check
curl http://localhost:8081/api/health

# Guest login
curl -X POST http://localhost:8081/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-device"}'

# Submit steps
curl -X POST http://localhost:8081/api/steps \
  -H "Content-Type: application/json" \
  -d '{"steps": 5000}'

# Convert to credits
curl -X POST http://localhost:8081/api/credits/convert \
  -H "Content-Type: application/json" \
  -d '{"steps": 5000}'
```

### **4. Access Web Interface**
Open **http://localhost:8081** in your browser to access the web interface.

## 📊 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/guest` | POST | Guest user login |
| `/api/steps` | POST | Submit daily steps |
| `/api/credits/convert` | POST | Convert steps to eco-credits |
| `/api/credits/balance` | GET | Get user's credit balance |
| `/api/user/profile` | GET | Get user profile and stats |
| `/api/achievements` | GET | Get user achievements |

## 🌱 **Eco-Credit System**

### **Credit Calculation**
- **Base Rate**: 1 eco-credit per 100 steps
- **Bonus Credits**: 
  - 10 credits for 1,000+ steps (Getting started)
  - 25 credits for 5,000+ steps (Halfway goal)
  - 50 credits for 10,000+ steps (Daily sustainable goal)

### **Achievements**
- 🌱 **First Steps**: Complete 100 steps
- 🚶‍♂️ **Green Walker**: Walk 1,000 steps in a day
- 🏃‍♀️ **Eco Stepper**: Walk 5,000 steps in a day
- 🏆 **Sustainable Champion**: Reach 10,000 steps in a day

## 🔧 **Configuration**

### **Port Configuration**
The application runs on port 8081 by default. To change it:

```properties
# In application.properties
server.port=8081
```

### **Database Configuration**
- **Development**: H2 in-memory database (default)
- **Production**: MySQL database

```properties
# For MySQL production
spring.datasource.url=jdbc:mysql://localhost:3306/ecocredit
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 🛠️ **Development**

### **Project Structure**
```
backend-java/
├── src/main/java/com/ecocredit/
│   ├── controller/     # REST API endpoints
│   ├── service/        # Business logic
│   ├── repository/     # Database operations
│   ├── model/          # Data entities
│   └── config/         # Configuration classes
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

### **Key Files to Modify**
- **Credit Calculation**: `CreditService.java`
- **Achievement Logic**: `AchievementService.java`
- **API Endpoints**: `EcoCreditController.java`
- **Database Schema**: Model classes in `model/` package

### **Adding New Features**
1. Create entity in `model/` package
2. Add repository interface in `repository/` package
3. Implement business logic in `service/` package
4. Add API endpoints in `controller/` package

## 🌟 **Future Green Activities**

The system is designed to expand beyond step tracking:

### **Planned Features**
- **Recycling Tracker**: Track recycling activities
- **Energy Conservation**: Monitor energy usage
- **Sustainable Shopping**: Track eco-friendly purchases
- **Community Challenges**: Group sustainability goals
- **Carbon Footprint Calculator**: Estimate environmental impact

### **Integration Possibilities**
- **Smart Home Devices**: IoT integration for energy tracking
- **Wearable Devices**: Direct step data integration
- **Retail Partners**: Sustainable shopping rewards
- **Environmental Organizations**: Real-world impact tracking

## 📈 **Environmental Impact Goals**

### **Short-term (3 months)**
- 1,000+ active users
- 1 million+ steps tracked
- 10,000+ eco-credits earned

### **Medium-term (6 months)**
- 5,000+ active users
- 5 million+ steps tracked
- 50,000+ eco-credits earned
- Introduction of recycling tracking

### **Long-term (1 year)**
- 20,000+ active users
- 20 million+ steps tracked
- 200,000+ eco-credits earned
- Full feature set with multiple green activities

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🌱 Together, we can make sustainable living fun and rewarding!** 


