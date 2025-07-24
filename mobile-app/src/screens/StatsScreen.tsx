import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { getStepHistory, getUserStats } from '../services/StepTrackingService';

const { width } = Dimensions.get('window');

const StatsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { steps } = useSelector((state: RootState) => state.steps);
  const { balance } = useSelector((state: RootState) => state.credits);
  
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    try {
      const [weeklySteps, stats] = await Promise.all([
        getStepHistory(7),
        getUserStats(),
      ]);
      
      setWeeklyData(weeklySteps);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading stats data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatsData();
    setRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getDayName = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
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
      {/* Today's Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Today's Summary</Title>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Steps</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(steps * 0.04)}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{(steps * 0.0008).toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {balance?.availableCredits?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.summaryLabel}>Credits</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Personal Records */}
      {userStats && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Personal Records</Title>
            <View style={styles.recordsGrid}>
              <View style={styles.recordItem}>
                <Text style={styles.recordValue}>
                  {userStats.totalSteps?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.recordLabel}>Total Steps</Text>
              </View>
              <View style={styles.recordItem}>
                <Text style={styles.recordValue}>
                  {userStats.maxSteps?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.recordLabel}>Best Day</Text>
              </View>
              <View style={styles.recordItem}>
                <Text style={styles.recordValue}>
                  {Math.round(userStats.avgSteps || 0).toLocaleString()}
                </Text>
                <Text style={styles.recordLabel}>Daily Average</Text>
              </View>
              <View style={styles.recordItem}>
                <Text style={styles.recordValue}>
                  {userStats.daysTracked || '0'}
                </Text>
                <Text style={styles.recordLabel}>Days Tracked</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Goals Progress */}
      <Card style={[styles.card, styles.lastCard]}>
        <Card.Content>
          <Title style={styles.cardTitle}>Goals Progress</Title>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Daily Goal (10,000 steps)</Text>
              <Text style={styles.goalPercentage}>
                {Math.round((steps / 10000) * 100)}%
              </Text>
            </View>
            <View style={styles.goalBar}>
              <View
                style={[
                  styles.goalProgress,
                  {
                    width: `${Math.min((steps / 10000) * 100, 100)}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.goalSubtext}>
              {steps >= 10000
                ? '🎉 Goal achieved!'
                : `${(10000 - steps).toLocaleString()} steps to go`
              }
            </Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recordItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  recordValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#52c41a',
  },
  goalBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 6,
  },
  goalProgress: {
    height: '100%',
    borderRadius: 4,
  },
  goalSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default StatsScreen;