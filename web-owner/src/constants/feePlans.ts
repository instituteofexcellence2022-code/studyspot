/**
 * Shared Fee Plans Constants
 * Centralized fee plan data to avoid duplication
 */

export interface FeePlan {
  id: string;
  name: string;
  description: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'combo';
  basePrice: number;
  status: 'active' | 'inactive';
  isPopular?: boolean;
  features: string[];
  shiftPricing?: {
    morning?: number;
    afternoon?: number;
    evening?: number;
    night?: number;
  };
  zonePricing?: {
    ac?: number;
    nonAc?: number;
    premium?: number;
    quiet?: number;
    general?: number;
  };
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    validFrom?: string;
    validTo?: string;
  };
  maxSeats?: number;
  maxHours?: number;
  scholarshipEligible?: boolean;
  waiverAllowed?: boolean;
}

/**
 * Default fee plans used as fallback when API is unavailable
 */
export const DEFAULT_FEE_PLANS: FeePlan[] = [
  {
    id: 'hourly-basic',
    name: 'Hourly Basic',
    description: 'Pay per hour for flexible usage',
    type: 'hourly',
    basePrice: 25,
    status: 'active',
    isPopular: false,
    features: [
      'Flexible hourly booking',
      'Basic amenities access',
      'WiFi included',
      'Power outlets available'
    ],
    shiftPricing: {
      morning: 20,
      afternoon: 25,
      evening: 30,
      night: 35
    },
    zonePricing: {
      ac: 30,
      nonAc: 20,
      premium: 40,
      quiet: 35,
      general: 25
    },
    maxSeats: 1,
    maxHours: 8,
    scholarshipEligible: true,
    waiverAllowed: true
  },
  {
    id: 'daily-pass',
    name: 'Daily Pass',
    description: 'Full day access with all amenities',
    type: 'daily',
    basePrice: 150,
    status: 'active',
    isPopular: true,
    features: [
      'Full day access (8 AM - 10 PM)',
      'All amenities included',
      'Lunch break allowed',
      'Priority seating',
      'Study materials access'
    ],
    shiftPricing: {
      morning: 120,
      afternoon: 150,
      evening: 180
    },
    zonePricing: {
      ac: 180,
      nonAc: 120,
      premium: 200,
      quiet: 160,
      general: 150
    },
    maxSeats: 1,
    maxHours: 14,
    scholarshipEligible: true,
    waiverAllowed: true
  },
  {
    id: 'monthly-unlimited',
    name: 'Monthly Unlimited',
    description: 'Unlimited access for the entire month',
    type: 'monthly',
    basePrice: 2500,
    status: 'active',
    isPopular: false,
    features: [
      'Unlimited monthly access',
      'All amenities included',
      'Priority booking',
      'Study materials access',
      'Monthly progress report',
      'Flexible timing'
    ],
    discount: {
      type: 'percentage',
      value: 10,
      validFrom: '2024-01-01',
      validTo: '2024-12-31'
    },
    maxSeats: 1,
    maxHours: -1, // unlimited
    scholarshipEligible: true,
    waiverAllowed: true
  },
  {
    id: 'quarterly-premium',
    name: 'Quarterly Premium',
    description: 'Premium access for 3 months with exclusive benefits',
    type: 'quarterly',
    basePrice: 6500,
    status: 'active',
    isPopular: false,
    features: [
      '3 months unlimited access',
      'Premium amenities',
      'Exclusive study rooms',
      'Personal study plan',
      'Monthly mentoring session',
      'Priority support',
      'Free printing (100 pages)'
    ],
    discount: {
      type: 'percentage',
      value: 15,
      validFrom: '2024-01-01',
      validTo: '2024-12-31'
    },
    maxSeats: 1,
    maxHours: -1, // unlimited
    scholarshipEligible: false,
    waiverAllowed: false
  }
];

/**
 * Get the recommended fee plan (usually Daily Pass)
 */
export const getRecommendedFeePlan = (): string => {
  return 'daily-pass';
};

/**
 * Get fee plans by type
 */
export const getFeePlansByType = (type: FeePlan['type']): FeePlan[] => {
  return DEFAULT_FEE_PLANS.filter(plan => plan.type === type);
};

/**
 * Get popular fee plans
 */
export const getPopularFeePlans = (): FeePlan[] => {
  return DEFAULT_FEE_PLANS.filter(plan => plan.isPopular);
};














