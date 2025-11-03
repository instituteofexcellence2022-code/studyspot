/**
 * Shared Subscription Plans Constants
 * Centralized subscription plan data to avoid duplication
 */

import { SubscriptionPlan } from '../types/subscription';

/**
 * Default subscription plans used as fallback when API is unavailable
 * These should match the API response structure exactly
 */
export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    display_name: 'Free Tier',
    description: 'Perfect for getting started',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      '1 Library Location',
      'Up to 50 Seats',
      'Basic Analytics',
      'Email Support',
      'QR Attendance System',
      'Essential Reports'
    ],
    limits: {
      max_libraries: 1,
      max_users: 50,
      max_seats: 50,
      max_staff: 2,
      ai_features: false,
      analytics: true,
      api_access: false,
      priority_support: false,
      custom_branding: false
    },
    is_active: true
  },
  {
    id: 'starter',
    name: 'Starter',
    display_name: 'Starter',
    description: 'Perfect for small libraries',
    price_monthly: 99,
    price_yearly: 950, // 20% discount
    features: [
      '2 Library Locations',
      'Up to 200 Seats',
      '5 Staff Members',
      'Advanced Analytics',
      'Priority Support',
      'WhatsApp Integration',
      'Multi-branch Support'
    ],
    limits: {
      max_libraries: 2,
      max_users: 200,
      max_seats: 200,
      max_staff: 5,
      ai_features: false,
      analytics: true,
      api_access: false,
      priority_support: true,
      custom_branding: false
    },
    is_active: true
  },
  {
    id: 'professional',
    name: 'Professional',
    display_name: 'Professional',
    description: 'Most popular for growing businesses',
    price_monthly: 249,
    price_yearly: 2390, // 20% discount
    features: [
      'Unlimited Library Locations',
      'Up to 1000 Seats',
      'Unlimited Staff',
      'AI-powered Analytics',
      'Priority Support',
      'WhatsApp Business API',
      'API Access',
      'Custom Integrations',
      'Advanced Reporting'
    ],
    limits: {
      max_libraries: -1,
      max_users: 1000,
      max_seats: 1000,
      max_staff: -1,
      ai_features: true,
      analytics: true,
      api_access: true,
      priority_support: true,
      custom_branding: false
    },
    is_active: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    display_name: 'Enterprise',
    description: 'For large organizations',
    price_monthly: 599,
    price_yearly: 5750, // 20% discount
    features: [
      'Unlimited Libraries',
      'Unlimited Seats',
      'Unlimited Staff',
      'AI-powered Features',
      '24/7 Dedicated Support',
      'White-label Solution',
      'Full API Access',
      'Custom Development',
      'SLA Guarantee',
      'Custom Domain'
    ],
    limits: {
      max_libraries: -1,
      max_users: -1,
      max_seats: -1,
      max_staff: -1,
      ai_features: true,
      analytics: true,
      api_access: true,
      priority_support: true,
      custom_branding: true
    },
    is_active: true
  }
];

/**
 * Get the recommended plan (usually Professional)
 */
export const getRecommendedPlan = (): string => {
  return 'professional';
};

/**
 * Calculate yearly savings for a plan
 */
export const calculateYearlySavings = (plan: SubscriptionPlan) => {
  const monthlyTotal = plan.price_monthly * 12;
  const yearlySavings = monthlyTotal - plan.price_yearly;
  const savingsPercent = Math.round((yearlySavings / monthlyTotal) * 100);
  return { amount: yearlySavings, percent: savingsPercent };
};














