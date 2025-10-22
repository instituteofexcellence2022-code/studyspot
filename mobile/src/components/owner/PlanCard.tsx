/**
 * Plan Card Component
 * Reusable card for displaying subscription plan details
 * 
 * @author Agent 3 - Senior Mobile Developer (20+ Years)
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Plan} from '../../types';

interface PlanCardProps {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect?: (plan: Plan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingCycle,
  isCurrent = false,
  isPopular = false,
  onSelect,
}) => {
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const savings = billingCycle === 'yearly' 
    ? Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCurrent && styles.currentCard,
        isPopular && styles.popularCard,
      ]}
      onPress={() => onSelect?.(plan)}
      disabled={isCurrent || !onSelect}
      activeOpacity={0.7}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.planName}>{plan.display_name}</Text>
        {isCurrent && <Text style={styles.currentBadge}>Current Plan</Text>}
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      <View style={styles.priceSection}>
        <Text style={styles.currency}>$</Text>
        <Text style={styles.price}>{price.toFixed(0)}</Text>
        <Text style={styles.period}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
      </View>

      {savings > 0 && (
        <Text style={styles.savings}>Save {savings}% with annual billing</Text>
      )}

      <View style={styles.divider} />

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Features:</Text>
        {plan.features.slice(0, 5).map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {plan.features.length > 5 && (
          <Text style={styles.moreFeatures}>+{plan.features.length - 5} more</Text>
        )}
      </View>

      <View style={styles.limitsSection}>
        <Text style={styles.limitsTitle}>Limits:</Text>
        <Text style={styles.limitText}>• {plan.limits.max_libraries} Libraries</Text>
        <Text style={styles.limitText}>• {plan.limits.max_users} Users</Text>
        <Text style={styles.limitText}>• {plan.limits.max_bookings_per_month} Bookings/month</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  popularCard: {
    borderColor: '#1976d2',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  currentBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  savings: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkmark: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#1976d2',
    fontStyle: 'italic',
    marginTop: 4,
  },
  limitsSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  limitsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  limitText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
});

export default PlanCard;


