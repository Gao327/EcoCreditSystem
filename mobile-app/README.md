# EcoCredit Mobile App

A comprehensive mobile application for environmental sustainability, tracking eco-friendly activities, earning credits, and redeeming environmental rewards. Built with React Native and Expo.

## Features

### 🏠 Home Screen
- **EcoCredit Balance**: Real-time credit balance display
- **Step Tracking**: Track daily steps and convert to credits
- **Progress Visualization**: Animated progress bars and motivational messages
- **Credit Conversion**: Convert steps to credits instantly
- **Activity Stats**: Environmental impact calculations
- **Quick Actions**: Easy navigation to rewards and profile

### 🎁 Rewards Screen
- **Browse Rewards**: View available rewards by category
- **Filter & Search**: Find rewards by category or search terms
- **Redeem Rewards**: Convert credits to real-world rewards
- **Credit Balance**: Real-time credit balance display
- **Partner Rewards**: Rewards from various partner businesses

### 📊 Statistics Screen
- **Daily Summary**: Today's steps, calories, distance, and credits
- **Lifetime Stats**: Total credits earned, spent, achievements, and redemptions
- **Weekly Progress**: Visual weekly step tracking
- **Recent Achievements**: Display unlocked achievements
- **Redemption History**: Track past reward redemptions
- **Performance Insights**: Personalized insights and recommendations

### 👤 Profile Screen
- **User Authentication**: Guest login and Google sign-in
- **Profile Management**: User information and preferences
- **Achievement Display**: Show unlocked achievements
- **Active Vouchers**: View and manage active reward vouchers
- **Credit Summary**: Lifetime credit statistics
- **Activity Summary**: Quick stats overview

## Technical Features

### 🔐 Authentication
- Guest login with device ID
- Google OAuth integration
- Secure token storage
- Automatic session management

### 💳 EcoCredit System
- Step-to-credit conversion (100 steps = 1 credit)
- Environmental impact tracking
- Real-time balance updates
- Lifetime earning/spending tracking
- Credit history

### 🏆 Achievement System
- Unlockable achievements based on activity
- Progress tracking
- Achievement categories
- Credit rewards for achievements

### 🎫 Redemption System
- Reward catalog browsing
- Category filtering
- Voucher generation
- Redemption history
- Expiry tracking

### 📱 UI/UX Features
- Modern Material Design 3
- Smooth animations and haptic feedback
- Pull-to-refresh functionality
- Loading states and error handling
- Responsive design
- Dark/light theme support

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

### Backend Connection

The app connects to the Java Spring Boot backend running on `http://localhost:8080`. Make sure the backend is running before testing the mobile app.

## API Endpoints

The app integrates with the following backend endpoints:

- **Authentication**: `/api/auth/guest`, `/api/auth/google`
- **Steps**: `/api/steps`, `/api/credits/convert`
- **Rewards**: `/api/rewards`, `/api/rewards/{id}/redeem`
- **Achievements**: `/api/achievements`
- **Redemptions**: `/api/redemptions/history`, `/api/redemptions/vouchers`
- **Profile**: `/api/user/profile`

## State Management

The app uses Redux Toolkit for state management with the following slices:

- **User Slice**: Authentication and user data
- **Steps Slice**: Step tracking and goals
- **Credits Slice**: Credit balance and transactions
- **Rewards Slice**: Available rewards and redemptions

## Services

- **AuthService**: Authentication and user management
- **StepTrackingService**: Step counting and history
- **CreditService**: Credit conversion and balance
- **RewardsService**: Reward browsing and redemption
- **AchievementService**: Achievement tracking
- **RedemptionService**: Voucher management

## Development

### Project Structure
```
src/
├── screens/          # Screen components
├── services/         # API services
├── store/           # Redux store and slices
└── components/      # Reusable components
```

### Adding New Features

1. Create new service in `src/services/`
2. Add Redux slice if needed in `src/store/slices/`
3. Create screen component in `src/screens/`
4. Update navigation in `App.tsx`
5. Test with backend integration

## Testing

Run the test suite:
```bash
npm test
```

## Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Test on both iOS and Android
5. Update documentation

## License

MIT License - see LICENSE file for details. 