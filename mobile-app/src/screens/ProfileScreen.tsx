import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, List, useTheme, Avatar, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../store/store';
import { updateUser } from '../store/slices/userSlice';
import { updateCredits } from '../store/slices/creditSlice';
import { getProfile, guestLogin, googleSignIn } from '../services/AuthService';
import { getAchievements } from '../services/AchievementService';
import { getRedemptionHistory, getActiveVouchers } from '../services/RedemptionService';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
}

interface Redemption {
  id: number;
  rewardName: string;
  creditCost: number;
  redeemedAt: string;
  status: 'active' | 'used' | 'expired';
  voucherCode?: string;
  expiryDate?: string;
}

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.user);
  const { balance } = useSelector((state: RootState) => state.credits);
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [vouchers, setVouchers] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAchievements(),
        loadRedemptions(),
        loadVouchers(),
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await getAchievements();
      if (response.success) {
        setAchievements(response.achievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadRedemptions = async () => {
    try {
      const response = await getRedemptionHistory();
      if (response.success) {
        setRedemptions(response.redemptions);
      }
    } catch (error) {
      console.error('Error loading redemptions:', error);
    }
  };

  const loadVouchers = async () => {
    try {
      const response = await getActiveVouchers();
      if (response.success) {
        setVouchers(response.vouchers);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleGuestLogin = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await guestLogin();
      if (response.success) {
        dispatch(updateUser(response.user));
        dispatch(updateCredits(response.user.credits));
        Alert.alert('Success', 'Logged in as guest!');
      } else {
        Alert.alert('Error', 'Failed to login as guest');
      }
    } catch (error) {
      console.error('Error with guest login:', error);
      Alert.alert('Error', 'Failed to login as guest');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await googleSignIn();
      if (response.success) {
        dispatch(updateUser(response.user));
        dispatch(updateCredits(response.user.credits));
        Alert.alert('Success', 'Logged in with Google!');
      } else {
        Alert.alert('Error', 'Failed to login with Google');
      }
    } catch (error) {
      console.error('Error with Google sign in:', error);
      Alert.alert('Error', 'Failed to login with Google');
    }
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(achievement => achievement.isUnlocked);
  };

  const getActiveVouchersCount = () => {
    return vouchers.filter(voucher => voucher.status === 'active').length;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
      {/* User Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.userHeader}>
            <Avatar.Text size={64} label={user?.username?.substring(0, 2).toUpperCase() || 'GU'} />
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user?.username || 'Guest User'}</Title>
              <Text style={styles.userEmail}>{user?.email || 'guest@stepcredit.com'}</Text>
              {user?.isGuest && (
                <Chip style={styles.guestChip} textStyle={styles.guestChipText}>
                  Guest Account
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Credits Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Credits Summary</Title>
          <View style={styles.creditsGrid}>
            <View style={styles.creditItem}>
              <Ionicons name="diamond" size={20} color="#ffd700" />
              <Text style={styles.creditValue}>{balance?.availableCredits || 0}</Text>
              <Text style={styles.creditLabel}>Available</Text>
            </View>
            <View style={styles.creditItem}>
              <Ionicons name="trending-up" size={20} color="#52c41a" />
              <Text style={styles.creditValue}>{balance?.lifetimeEarned || 0}</Text>
              <Text style={styles.creditLabel}>Lifetime Earned</Text>
            </View>
            <View style={styles.creditItem}>
              <Ionicons name="trending-down" size={20} color="#ff4d4f" />
              <Text style={styles.creditValue}>{balance?.lifetimeSpent || 0}</Text>
              <Text style={styles.creditLabel}>Lifetime Spent</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Activity Summary</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#ffd700" />
              <Text style={styles.statValue}>{getUnlockedAchievements().length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="gift" size={24} color="#1890ff" />
              <Text style={styles.statValue}>{redemptions.length}</Text>
              <Text style={styles.statLabel}>Redemptions</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="card" size={24} color="#52c41a" />
              <Text style={styles.statValue}>{getActiveVouchersCount()}</Text>
              <Text style={styles.statLabel}>Active Vouchers</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
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
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Active Vouchers */}
      {vouchers.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Active Vouchers</Title>
            {vouchers.filter(v => v.status === 'active').slice(0, 2).map((voucher) => (
              <View key={voucher.id} style={styles.voucherItem}>
                <View style={styles.voucherInfo}>
                  <Text style={styles.voucherName}>{voucher.rewardName}</Text>
                  <Text style={styles.voucherCode}>Code: {voucher.voucherCode}</Text>
                  <Text style={styles.voucherExpiry}>Expires: {voucher.expiryDate}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Authentication */}
      {!user && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Sign In</Title>
                          <Button
                mode="contained"
                onPress={handleGuestLogin}
                style={styles.authButton}
                icon="account"
              >
                Continue as Guest
              </Button>
              <Button
                mode="outlined"
                onPress={handleGoogleSignIn}
                style={styles.authButton}
                icon="google"
              >
                Sign in with Google
              </Button>
          </Card.Content>
        </Card>
      )}

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Settings</Title>
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Notifications')}
          />
          <List.Item
            title="Privacy"
            description="Privacy and data settings"
            left={(props) => <List.Icon {...props} icon="shield" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Privacy')}
          />
          <List.Item
            title="About"
            description="App version and information"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('About')}
          />
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  guestChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  guestChipText: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  creditsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditItem: {
    alignItems: 'center',
    flex: 1,
  },
  creditValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginTop: 4,
    marginBottom: 4,
  },
  creditLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
  },
  voucherItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  voucherCode: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  voucherExpiry: {
    fontSize: 12,
    opacity: 0.5,
  },
  authButton: {
    marginBottom: 12,
    borderRadius: 20,
  },
});

export default ProfileScreen; 