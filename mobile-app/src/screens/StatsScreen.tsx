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
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store/store';
import { getStepHistory, getUserStats } from '../services/StepTrackingService';
import { getAchievements } from '../services/AchievementService';
import { getRedemptionHistory, getRedemptionStats } from '../services/RedemptionService';

const { width } = Dimensions.get('window');

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
}

interface Redemption {
  id: number;
  rewardName: string;
  creditCost: number;
  redeemedAt: string;
  status: 'active' | 'used' | 'expired';
}

const StatsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { steps } = useSelector((state: RootState) => state.steps);
  const { balance } = useSelector((state: RootState) => state.credits);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [redemptionStats, setRedemptionStats] = useState<any>(null);

  useEffect(() => {
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      const [weeklySteps, stats, achievementsData, redemptionsData, redemptionStatsData] = await Promise.all([
        getStepHistory(7),
        getUserStats(),
        getAchievements(),
        getRedemptionHistory(),
        getRedemptionStats(),
      ]);
      
      setWeeklyData(weeklySteps);
      setUserStats(stats);
      if (achievementsData.success) {
        setAchievements(achievementsData.achievements);
      }
      if (redemptionsData.success) {
        setRedemptions(redemptionsData.redemptions);
      }
      if (redemptionStatsData.success) {
        setRedemptionStats(redemptionStatsData.stats);
      }
    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setLoading(false);
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

  const getUnlockedAchievements = () => {
    return achievements.filter(achievement => achievement.isUnlocked);
  };

  const getActiveRedemptions = () => {
    return redemptions.filter(redemption => redemption.status === 'active');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

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
              <Ionicons name="footsteps" size={24} color={theme.colors.primary} />
              <Text style={styles.summaryValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Steps</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="flame" size={24} color="#ff4d4f" />
              <Text style={styles.summaryValue}>{Math.round(steps * 0.04)}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="map" size={24} color="#1890ff" />
              <Text style={styles.summaryValue}>{(steps * 0.0008).toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="diamond" size={24} color="#ffd700" />
              <Text style={styles.summaryValue}>{Math.floor(steps * 0.01)}</Text>
              <Text style={styles.summaryLabel}>Credits</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Lifetime Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Lifetime Statistics</Title>
          <View style={styles.lifetimeGrid}>
            <View style={styles.lifetimeItem}>
              <Ionicons name="trending-up" size={20} color="#52c41a" />
              <Text style={styles.lifetimeValue}>
                {formatNumber(balance?.lifetimeEarned || 0)}
              </Text>
              <Text style={styles.lifetimeLabel}>Credits Earned</Text>
            </View>
            <View style={styles.lifetimeItem}>
              <Ionicons name="trending-down" size={20} color="#ff4d4f" />
              <Text style={styles.lifetimeValue}>
                {formatNumber(balance?.lifetimeSpent || 0)}
              </Text>
              <Text style={styles.lifetimeLabel}>Credits Spent</Text>
            </View>
            <View style={styles.lifetimeItem}>
              <Ionicons name="trophy" size={20} color="#ffd700" />
              <Text style={styles.lifetimeValue}>
                {getUnlockedAchievements().length}
              </Text>
              <Text style={styles.lifetimeLabel}>Achievements</Text>
            </View>
            <View style={styles.lifetimeItem}>
              <Ionicons name="gift" size={20} color="#1890ff" />
              <Text style={styles.lifetimeValue}>
                {redemptions.length}
              </Text>
              <Text style={styles.lifetimeLabel}>Redemptions</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Progress */}
      {weeklyData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Weekly Progress</Title>
            <View style={styles.weeklyContainer}>
              {weeklyData.map((day, index) => (
                <View key={index} style={styles.dayItem}>
                  <Text style={styles.dayName}>{getDayName(new Date(day.date))}</Text>
                  <View style={styles.dayBar}>
                    <View 
                      style={[
                        styles.dayProgress, 
                        { 
                          height: Math.max(20, (day.steps / 10000) * 100),
                          backgroundColor: day.steps >= 10000 ? theme.colors.primary : '#e0e0e0'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.daySteps}>{formatNumber(day.steps)}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recent Achievements */}
      {getUnlockedAchievements().length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Achievements</Title>
            <View style={styles.achievementsContainer}>
              {getUnlockedAchievements().slice(0, 3).map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <Ionicons name={achievement.icon as any} size={24} color="#ffd700" />
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    {achievement.unlockedDate && (
                      <Text style={styles.achievementDate}>
                        Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Redemption Activity */}
      {redemptions.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Redemptions</Title>
            <View style={styles.redemptionsContainer}>
              {redemptions.slice(0, 3).map((redemption) => (
                <View key={redemption.id} style={styles.redemptionItem}>
                  <Ionicons name="gift" size={20} color="#1890ff" />
                  <View style={styles.redemptionInfo}>
                    <Text style={styles.redemptionName}>{redemption.rewardName}</Text>
                    <Text style={styles.redemptionDate}>
                      {new Date(redemption.redeemedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip 
                    style={[
                      styles.statusChip,
                      { backgroundColor: redemption.status === 'active' ? '#52c41a' : '#ff4d4f' }
                    ]}
                    textStyle={styles.statusChipText}
                  >
                    {redemption.status}
                  </Chip>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Performance Insights */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Performance Insights</Title>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={20} color="#52c41a" />
              <Text style={styles.insightText}>
                {steps >= 10000 ? 'Great job! You hit your daily goal!' : `${10000 - steps} more steps to reach your goal`}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="diamond" size={20} color="#ffd700" />
              <Text style={styles.insightText}>
                You've earned {Math.floor(steps * 0.01)} credits today
              </Text>
            </View>
            {getUnlockedAchievements().length > 0 && (
              <View style={styles.insightItem}>
                <Ionicons name="trophy" size={20} color="#ffd700" />
                <Text style={styles.insightText}>
                  {getUnlockedAchievements().length} achievements unlocked
                </Text>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  lifetimeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lifetimeItem: {
    alignItems: 'center',
    flex: 1,
  },
  lifetimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  lifetimeLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  dayBar: {
    width: 20,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dayProgress: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  daySteps: {
    fontSize: 10,
    opacity: 0.7,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementInfo: {
    marginLeft: 12,
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 10,
    opacity: 0.5,
  },
  redemptionsContainer: {
    gap: 12,
  },
  redemptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  redemptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  redemptionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  redemptionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    color: 'white',
  },
  insightsContainer: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});

export default StatsScreen;