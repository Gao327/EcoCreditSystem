import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Button, useTheme } from 'react-native-paper';

const RewardsScreen: React.FC = () => {
  const theme = useTheme();

  const mockRewards = [
    {
      id: '1',
      name: 'Coffee Voucher',
      description: 'Free coffee at partner cafes',
      cost: 100,
      icon: '☕',
    },
    {
      id: '2',
      name: 'Fitness Gear Pack',
      description: 'Water bottle, towel, and resistance band',
      cost: 500,
      icon: '🏋️‍♂️',
    },
    {
      id: '3',
      name: 'Plant a Tree',
      description: 'Contribute to reforestation efforts',
      cost: 200,
      icon: '🌳',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.header}>Available Rewards</Text>
      
      {mockRewards.map((reward) => (
        <Card key={reward.id} style={styles.card}>
          <Card.Content>
            <View style={styles.rewardHeader}>
              <Text style={styles.icon}>{reward.icon}</Text>
              <View style={styles.rewardInfo}>
                <Title style={styles.rewardTitle}>{reward.name}</Title>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
              </View>
              <View style={styles.costContainer}>
                <Text style={styles.cost}>{reward.cost}</Text>
                <Text style={styles.credits}>credits</Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => console.log(`Redeem ${reward.name}`)}
              style={styles.redeemButton}
            >
              Redeem
            </Button>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rewardDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  costContainer: {
    alignItems: 'center',
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
  redeemButton: {
    borderRadius: 20,
  },
});

export default RewardsScreen; 