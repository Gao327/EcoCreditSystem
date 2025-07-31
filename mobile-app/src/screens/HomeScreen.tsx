import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Surface,
  useTheme,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Import Redux slices and services
import { RootState } from '../store/store';
import { updateSteps, setLoading } from '../store/slices/stepSlice';
import { updateCredits } from '../store/slices/creditSlice';
import { getCurrentSteps, syncStepsToServer } from '../services/StepTrackingService';
import { convertStepsToCredits, getUserBalance } from '../services/CreditService';
import { checkNetworkStatus } from '../services/NetworkService';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { steps, loading: stepsLoading } = useSelector((state: RootState) => state.steps);
  const { balance, loading: creditsLoading } = useSelector((state: RootState) => state.credits);
  
  const [refreshing, setRefreshing] = useState(false);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [isOffline, setIsOffline] = useState(false);

  const DAILY_GOAL = 10000;
  const progress = Math.min(steps / DAILY_GOAL, 1);

  useEffect(() => {
    loadInitialData();
    checkBackendStatus();
    
    // Set up step tracking interval
    const interval = setInterval(async () => {
      await updateStepData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnimation]);

  const checkBackendStatus = async () => {
    try {
      const networkStatus = await checkNetworkStatus();
      setIsOffline(!networkStatus.isBackendReachable);
    } catch (error) {
      console.error('Error checking backend status:', error);
      setIsOffline(true);
    }
  };

  const loadInitialData = async () => {
    dispatch(setLoading(true));
    try {
      await Promise.all([
        updateStepData(),
        loadCreditBalance(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateStepData = async () => {
    try {
      const currentSteps = await getCurrentSteps();
      dispatch(updateSteps(currentSteps));
      
      // Sync to server
      await syncStepsToServer(currentSteps);
    } catch (error) {
      console.error('Error updating step data:', error);
    }
  };

  const loadCreditBalance = async () => {
    try {
      const userBalance = await getUserBalance();
      dispatch(updateCredits(userBalance));
    } catch (error) {
      console.error('Error loading credit balance:', error);
    }
  };

  const handleConvertCredits = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await convertStepsToCredits(steps);
      if (result.success) {
        dispatch(updateCredits(result.data.balance));
        // Show success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error converting credits:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const getMotivationalMessage = () => {
    if (steps === 0) return "Let's start your journey! 🚀";
    if (steps < 2000) return "Great start! Keep going! 💪";
    if (steps < 5000) return "You're doing awesome! 🌟";
    if (steps < 8000) return "Almost there! Push forward! 🔥";
    if (steps >= DAILY_GOAL) return "Goal achieved! You're amazing! 🎉";
    return "So close to your goal! 🎯";
  };

  const getStepsRemaining = () => {
    const remaining = DAILY_GOAL - steps;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Offline Indicator */}
      {isOffline && (
        <Card style={[styles.offlineCard, { backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }]}>
          <Card.Content>
            <View style={styles.offlineContainer}>
              <Ionicons name="wifi-outline" size={20} color="#856404" />
              <Text style={styles.offlineText}>
                Offline Mode - Backend not connected
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Main Step Counter Card */}
      <Surface style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={[theme.colors.primary, '#73d13d']}
          style={styles.gradientCard}
        >
          <View style={styles.stepCounterContainer}>
            <Text style={styles.stepCounterTitle}>EcoCredit Balance</Text>
            <Text style={styles.stepCounterNumber}>
              {balance?.availableCredits?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.stepCounterSubtitle}>
              {steps.toLocaleString()} steps today
            </Text>
          </View>
        </LinearGradient>
      </Surface>

      {/* Progress Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Title style={styles.progressTitle}>Daily Goal Progress</Title>
              <Paragraph style={styles.progressText}>
                {getStepsRemaining() > 0 
                  ? `${getStepsRemaining().toLocaleString()} steps to go!`
                  : 'Goal achieved! 🎉'
                }
              </Paragraph>
            </View>
            <View style={styles.progressPercentage}>
              <Text style={styles.percentageText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.goalContainer}>
            <Text style={styles.goalText}>Goal: {DAILY_GOAL.toLocaleString()} steps</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Credits Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.creditsHeader}>
            <View style={styles.creditsInfo}>
              <Title style={styles.creditsTitle}>
                <Ionicons name="leaf" size={20} color={theme.colors.primary} />
                {' '}Steps to Credits
              </Title>
              <Text style={styles.creditsBalance}>
                {steps.toLocaleString()}
              </Text>
              <Paragraph style={styles.creditsSubtext}>
                Steps Available to Convert
              </Paragraph>
            </View>
            <View style={styles.creditsActions}>
              <Button
                mode="contained"
                onPress={handleConvertCredits}
                style={styles.convertButton}
                contentStyle={styles.convertButtonContent}
                loading={creditsLoading}
                disabled={steps === 0}
              >
                Convert Steps
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Today's Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.statsTitle}>EcoCredit Activity</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="footsteps" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="diamond" size={24} color="#ffd700" />
              <Text style={styles.statValue}>
                {Math.floor(steps * 0.01)}
              </Text>
              <Text style={styles.statLabel}>Credits Earned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#ff4d4f" />
              <Text style={styles.statValue}>
                {Math.round(steps * 0.04)}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="map" size={24} color="#1890ff" />
              <Text style={styles.statValue}>
                {(steps * 0.0008).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={[styles.card, styles.lastCard]}>
        <Card.Content>
          <Title style={styles.actionsTitle}>EcoCredit Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to rewards */}}
              style={styles.actionButton}
              icon="gift"
            >
              Browse Rewards
            </Button>
                          <Button
                mode="outlined"
                onPress={() => {/* Navigate to profile */}}
                style={styles.actionButton}
                icon="person"
              >
                View Profile
              </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  stepCounterContainer: {
    alignItems: 'center',
  },
  stepCounterTitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  stepCounterNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepCounterSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lastCard: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressPercentage: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#52c41a',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalContainer: {
    alignItems: 'center',
  },
  goalText: {
    fontSize: 12,
    opacity: 0.6,
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditsInfo: {
    flex: 1,
  },
  creditsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  creditsBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 4,
  },
  creditsSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  creditsActions: {
    marginLeft: 16,
  },
  convertButton: {
    borderRadius: 20,
  },
  convertButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  offlineCard: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
});

export default HomeScreen; 