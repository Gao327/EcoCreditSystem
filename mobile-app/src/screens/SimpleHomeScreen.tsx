import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, useTheme, Surface, Title } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const SimpleHomeScreen: React.FC = () => {
  const theme = useTheme();
  const [steps, setSteps] = useState(0);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock step generation (in real app, this would come from device sensors)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSteps = Math.floor(Math.random() * 3000) + 2000; // 2000-5000 steps
      setSteps(randomSteps);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const convertStepsToCredits = async () => {
    setLoading(true);
    try {
      // Simple credit calculation: 1 credit per 100 steps + bonuses
      const baseCredits = Math.floor(steps / 100);
      let bonusCredits = 0;
      
      if (steps >= 10000) bonusCredits = 50;      // Daily goal bonus
      else if (steps >= 5000) bonusCredits = 25;  // Halfway bonus  
      else if (steps >= 1000) bonusCredits = 10;  // Getting started bonus

      const totalNewCredits = baseCredits + bonusCredits;
      setCredits(credits + totalNewCredits);
      
      alert(`🎉 Converted ${steps} steps into ${totalNewCredits} credits!\n\n` +
            `Base Credits: ${baseCredits}\n` + 
            `Bonus Credits: ${bonusCredits}\n` +
            `Total Credits: ${credits + totalNewCredits}`);
    } catch (error) {
      alert('Error converting credits');
    } finally {
      setLoading(false);
    }
  };

  const getGoalProgress = () => {
    return Math.min(steps / 10000, 1) * 100;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Step Credit Tracker</Text>
        <Text style={styles.headerSubtitle}>Walk. Earn. Repeat.</Text>
      </LinearGradient>

      {/* Today's Steps */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsLabel}>Today's Steps</Text>
            <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.goalText}>
              Goal: 10,000 steps ({Math.round(getGoalProgress())}% complete)
            </Text>
            
            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getGoalProgress()}%` }
                ]} 
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Credits Display */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsLabel}>Your Credits</Text>
            <Text style={styles.creditsValue}>{credits}</Text>
            <Text style={styles.creditsSubtext}>Earned by walking</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Conversion Info */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.cardTitle}>Credit Calculation</Title>
          <Text style={styles.conversionText}>
            • 100 steps = 1 credit{'\n'}
            • 1,000 steps = +10 bonus credits{'\n'}
            • 5,000 steps = +25 bonus credits{'\n'}
            • 10,000 steps = +50 bonus credits
          </Text>
          
          <Text style={styles.potentialText}>
            Your {steps.toLocaleString()} steps = {Math.floor(steps / 100)} base credits
            {steps >= 1000 && ' + bonus credits!'}
          </Text>
        </Card.Content>
      </Card>

      {/* Convert Button */}
      <Surface style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={convertStepsToCredits}
          loading={loading}
          disabled={loading || steps === 0}
          style={styles.convertButton}
          contentStyle={styles.buttonContent}
        >
          {loading ? 'Converting...' : `Convert ${steps.toLocaleString()} Steps to Credits`}
        </Button>
      </Surface>

      {/* Simple Stats */}
      <Card style={[styles.card, styles.lastCard]}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.cardTitle}>Quick Stats</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(steps * 0.04)}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(steps * 0.0008).toFixed(1)}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(steps * 0.8)}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 32,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  stepsContainer: {
    alignItems: 'center',
  },
  stepsLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  stepsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  creditsContainer: {
    alignItems: 'center',
  },
  creditsLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  creditsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFA000',
    marginBottom: 4,
  },
  creditsSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  conversionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  potentialText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f1f8e9',
    borderRadius: 8,
  },
  buttonContainer: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  convertButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default SimpleHomeScreen; 