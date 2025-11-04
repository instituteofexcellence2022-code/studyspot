/**
 * 📋 FEE PLAN TYPES
 * 
 * Matches Owner Portal fee plan structure
 */

export interface FeePlan {
  id: string;
  name: string;
  description?: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'combo';
  basePrice: number;
  
  // Shift-based pricing
  shift?: string; // morning, afternoon, evening, night
  shiftPricing?: {
    morning?: number;
    afternoon?: number;
    evening?: number;
    night?: number;
  };
  
  // Zone-based pricing
  zone?: string; // ac, non-ac, custom
  zonePricing?: {
    ac?: number;
    nonAc?: number;
    premium?: number;
    quiet?: number;
    general?: number;
  };
  
  // Discount & offers
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    validFrom?: string;
    validTo?: string;
  };
  
  // Features & limits
  features: string[];
  maxSeats?: number;
  maxHours?: number;
  
  // Scholarship/waiver
  scholarshipEligible?: boolean;
  waiverAllowed?: boolean;
  
  // Status
  status: 'active' | 'inactive' | 'draft';
  isPopular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftOption {
  id: string;
  label: string;
  time: string;
  price: number;
  icon: string;
  hours: number;
}

export interface ZoneOption {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  features: string[];
}

