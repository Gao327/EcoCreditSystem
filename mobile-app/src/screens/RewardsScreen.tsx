import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Button, useTheme, Chip, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../store/store';
import { updateCredits } from '../store/slices/creditSlice';
import { getRewards, redeemReward } from '../services/RewardsService';

interface Reward {
  id: number;
  name: string;
  description: string;
  creditCost: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  partnerName?: string;
  expiryDate?: string;
}

const RewardsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { balance } = useSelector((state: RootState) => state.credits);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'food', name: 'Food & Drinks', icon: 'restaurant' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness' },
    { id: 'eco', name: 'Eco-Friendly', icon: 'leaf' },
    { id: 'entertainment', name: 'Entertainment', icon: 'game-controller' },
  ];

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await getRewards();
      if (response.success) {
        setRewards(response.rewards);
      } else {
        Alert.alert('Error', 'Failed to load rewards');
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRewards();
    setRefreshing(false);
  };

  const handleRedeem = async (reward: Reward) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (balance?.availableCredits < reward.creditCost) {
        Alert.alert('Insufficient Credits', 'You need more credits to redeem this reward.');
        return;
      }

      const response = await redeemReward(reward.id);
      if (response.success) {
        // Update credit balance
        dispatch(updateCredits(response.data.balance));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success!', `You've successfully redeemed ${reward.name}!`);
        loadRewards(); // Refresh rewards
      } else {
        Alert.alert('Error', response.error || 'Failed to redeem reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      Alert.alert('Error', 'Failed to redeem reward');
    }
  };

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || 'gift';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading rewards...</Text>
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
      {/* Credits Balance */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceContainer}>
            <Ionicons name="diamond" size={24} color="#ffd700" />
            <Text style={styles.balanceText}>
              {balance?.availableCredits?.toLocaleString() || '0'} Credits Available
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
              icon={({ size, color }) => (
                <Ionicons 
                  name={category.icon as any} 
                  size={size} 
                  color={color} 
                />
              )}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Rewards List */}
      <View style={styles.rewardsContainer}>
        {filteredRewards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <Ionicons name="gift-outline" size={48} color={theme.colors.primary} />
                <Text style={styles.emptyTitle}>No rewards available</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedCategory === 'all' 
                    ? 'Check back later for new rewards!'
                    : 'No rewards in this category'
                  }
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          filteredRewards.map((reward) => (
            <Card key={reward.id} style={styles.rewardCard}>
              <Card.Content>
                <View style={styles.rewardHeader}>
                  <View style={styles.rewardIcon}>
                    <Ionicons 
                      name={getCategoryIcon(reward.category) as any} 
                      size={32} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Title style={styles.rewardTitle}>{reward.name}</Title>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                    {reward.partnerName && (
                      <Text style={styles.partnerName}>by {reward.partnerName}</Text>
                    )}
                  </View>
                  <View style={styles.costContainer}>
                    <Text style={styles.cost}>{reward.creditCost}</Text>
                    <Text style={styles.credits}>credits</Text>
                  </View>
                </View>
                
                <View style={styles.rewardActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleRedeem(reward)}
                    style={styles.redeemButton}
                    disabled={!reward.isAvailable || (balance?.availableCredits || 0) < reward.creditCost}
                    loading={false}
                  >
                    {reward.isAvailable ? 'Redeem' : 'Unavailable'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
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
  balanceCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
  },
  rewardsContainer: {
    flex: 1,
  },
  rewardCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rewardIcon: {
    marginRight: 12,
    paddingTop: 4,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  costContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  cost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  credits: {
    fontSize: 12,
    opacity: 0.7,
  },
  rewardActions: {
    alignItems: 'flex-end',
  },
  redeemButton: {
    borderRadius: 20,
  },
  emptyCard: {
    marginTop: 32,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default RewardsScreen; 