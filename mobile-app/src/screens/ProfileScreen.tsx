import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, List, useTheme, Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.user);
  const { balance } = useSelector((state: RootState) => state.credits);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* User Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.userHeader}>
            <Avatar.Text size={64} label="DU" />
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user?.username || 'Demo User'}</Title>
              <Text style={styles.userEmail}>{user?.email || 'demo@stepcredit.com'}</Text>
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
              <Text style={styles.creditValue}>{balance?.availableCredits || 0}</Text>
              <Text style={styles.creditLabel}>Available</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditValue}>{balance?.lifetimeEarned || 0}</Text>
              <Text style={styles.creditLabel}>Lifetime Earned</Text>
            </View>
            <View style={styles.creditItem}>
              <Text style={styles.creditValue}>{balance?.lifetimeSpent || 0}</Text>
              <Text style={styles.creditLabel}>Lifetime Spent</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

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
    marginBottom: 4,
  },
  creditLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default ProfileScreen; 