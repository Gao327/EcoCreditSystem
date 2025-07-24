import React from 'react';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

// Import simplified screen
import SimpleHomeScreen from './src/screens/SimpleHomeScreen';

// Custom theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4CAF50',      // Green primary color
    secondary: '#45A049',    // Darker green
    surface: '#ffffff',
    background: '#f5f5f5',   // Light gray background
  },
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" backgroundColor="#4CAF50" />
          <SimpleHomeScreen />
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