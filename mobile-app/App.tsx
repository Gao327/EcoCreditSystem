import React from 'react';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import HomeScreen from './src/screens/HomeScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',      // EcoCredit green primary color
    secondary: '#1B5E20',    // Darker green
    surface: '#ffffff',
    background: '#f8f9fa',   // Light background
  },
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" backgroundColor="#2E7D32" />
          <Provider store={store}>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                      iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Rewards') {
                      iconName = focused ? 'gift' : 'gift-outline';
                    } else if (route.name === 'Stats') {
                      iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Profile') {
                      iconName = focused ? 'person' : 'person-outline';
                    } else {
                      iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                  },
                  tabBarActiveTintColor: theme.colors.primary,
                  tabBarInactiveTintColor: 'gray',
                  tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                  },
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                  },
                  headerTintColor: 'white',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                })}
              >
                <Tab.Screen 
                  name="Home" 
                  component={HomeScreen}
                  options={{ title: 'EcoCredit' }}
                />
                <Tab.Screen 
                  name="Rewards" 
                  component={RewardsScreen}
                  options={{ title: 'Rewards' }}
                />
                <Tab.Screen 
                  name="Stats" 
                  component={StatsScreen}
                  options={{ title: 'Statistics' }}
                />
                <Tab.Screen 
                  name="Profile" 
                  component={ProfileScreen}
                  options={{ title: 'Profile' }}
                />
              </Tab.Navigator>
            </NavigationContainer>
          </Provider>
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;