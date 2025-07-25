# 📱 Real Step Tracking Setup Guide

## Prerequisites
- React Native development environment
- Physical device for testing (iOS/Android)
- Apple Developer Account (for iOS)
- Google Play Console (for Android)

## Step-by-Step Setup

### 1. React Native Environment Setup

#### **Install React Native CLI**
```bash
npm install -g @react-native-community/cli
```

#### **Create New React Native Project**
```bash
npx react-native init EcoCreditMobile --template react-native-template-typescript
cd EcoCreditMobile
```

### 2. Install Step Tracking Libraries

#### **For iOS (HealthKit)**
```bash
npm install react-native-health
npm install @react-native-community/async-storage
```

#### **For Android (Google Fit)**
```bash
npm install react-native-google-fit
npm install @react-native-community/async-storage
```

#### **Cross-platform (Expo)**
```bash
npx create-expo-app EcoCreditExpo --template blank-typescript
cd EcoCreditExpo
npx expo install expo-sensors expo-pedometer expo-location
```

### 3. iOS Setup (HealthKit)

#### **Configure Info.plist**
Add to `ios/EcoCreditMobile/Info.plist`:
```xml
<key>NSHealthShareUsageDescription</key>
<string>EcoCredit needs access to your step count to track your sustainable transportation activities</string>
<key>NSHealthUpdateUsageDescription</key>
<string>EcoCredit needs permission to update your health data</string>
```

#### **Configure Capabilities**
1. Open Xcode
2. Select your project
3. Go to "Signing & Capabilities"
4. Click "+" and add "HealthKit"

#### **Install Pods**
```bash
cd ios && pod install && cd ..
```

### 4. Android Setup (Google Fit)

#### **Configure build.gradle**
Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

#### **Configure AndroidManifest.xml**
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### 5. Implementation Code

#### **Step Tracking Service**
Create `src/services/StepTrackingService.ts`:
```typescript
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class StepTrackingService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      if (Platform.OS === 'ios') {
        await this.initializeHealthKit();
      } else if (Platform.OS === 'android') {
        await this.initializeGoogleFit();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize step tracking:', error);
    }
  }

  private async initializeHealthKit() {
    // iOS HealthKit implementation
    const { RNHealth } = NativeModules;
    await RNHealth.requestAuthorization(['StepCount']);
  }

  private async initializeGoogleFit() {
    // Android Google Fit implementation
    const { RNGoogleFit } = NativeModules;
    await RNGoogleFit.authorize();
  }

  async getTodaySteps(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        return await this.getHealthKitSteps();
      } else if (Platform.OS === 'android') {
        return await this.getGoogleFitSteps();
      }
      return 0;
    } catch (error) {
      console.error('Failed to get steps:', error);
      return 0;
    }
  }

  private async getHealthKitSteps(): Promise<number> {
    const { RNHealth } = NativeModules;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const steps = await RNHealth.getStepCount(startOfDay, today);
    return steps || 0;
  }

  private async getGoogleFitSteps(): Promise<number> {
    const { RNGoogleFit } = NativeModules;
    const steps = await RNGoogleFit.getDailySteps();
    return steps || 0;
  }

  async syncStepsToServer(steps: number) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://your-api.com/api/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ steps }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync steps');
      }
    } catch (error) {
      console.error('Failed to sync steps:', error);
    }
  }
}

export default new StepTrackingService();
```

### 6. Background Step Tracking

#### **iOS Background App Refresh**
Add to `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
    <string>background-fetch</string>
</array>
```

#### **Android Background Service**
Create `android/app/src/main/java/com/ecocredit/StepTrackingService.java`:
```java
public class StepTrackingService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Background step tracking implementation
        return START_STICKY;
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
```

### 7. Testing on Real Devices

#### **iOS Testing**
1. Connect iPhone to Mac
2. Open Xcode
3. Select your device
4. Build and run the app
5. Grant HealthKit permissions

#### **Android Testing**
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect device to computer
4. Run `adb devices` to verify connection
5. Run `npx react-native run-android`

### 8. Production Considerations

#### **Battery Optimization**
- Implement efficient step counting algorithms
- Use background fetch instead of continuous monitoring
- Batch sync data to reduce API calls

#### **Privacy Compliance**
- Implement proper consent flows
- Follow GDPR/CCPA requirements
- Provide clear privacy policy

#### **Error Handling**
- Handle permission denials gracefully
- Implement fallback step counting
- Provide offline functionality

## Estimated Development Time
- **Basic Implementation**: 2-3 weeks
- **Background Tracking**: 1-2 weeks
- **Testing & Optimization**: 1-2 weeks
- **Total**: 4-7 weeks 