/**
 * React Query Configuration
 * Provides API state management with caching, refetching, and error handling
 */

import { QueryClient } from '@tanstack/react-query';

// Default query options
const defaultQueryOptions = {
  queries: {
    // Cache time: how long inactive data stays in cache (24 hours)
    gcTime: 24 * 60 * 60 * 1000,
    
    // Stale time: how long data is considered fresh (5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Retry failed requests
    retry: 3,
    
    // Retry delay: exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (keep data fresh)
    refetchOnWindowFocus: true,
    
    // Don't refetch on reconnect in production
    refetchOnReconnect: process.env.NODE_ENV === 'production',
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
  },
  
  mutations: {
    // Retry failed mutations once
    retry: 1,
    
    // Retry delay for mutations
    retryDelay: 1000,
  },
};

// Create and export query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

/**
 * Query keys for consistent cache management
 */
export const QueryKeys = {
  // Auth
  AUTH_PROFILE: ['auth', 'profile'],
  
  // Users
  USERS: ['users'],
  USER_BY_ID: (id: string) => ['users', id],
  
  // Libraries
  LIBRARIES: ['libraries'],
  LIBRARY_BY_ID: (id: string) => ['libraries', id],
  
  // Bookings
  BOOKINGS: ['bookings'],
  BOOKING_BY_ID: (id: string) => ['bookings', id],
  BOOKINGS_BY_USER: (userId: string) => ['bookings', 'user', userId],
  BOOKINGS_BY_LIBRARY: (libraryId: string) => ['bookings', 'library', libraryId],
  
  // Tenants
  TENANTS: ['tenants'],
  TENANT_BY_ID: (id: string) => ['tenants', id],
  
  // Subscriptions
  SUBSCRIPTIONS: ['subscriptions'],
  SUBSCRIPTION_BY_ID: (id: string) => ['subscriptions', id],
  
  // Credit System
  CREDIT_BALANCE: ['credits', 'balance'],
  CREDIT_PACKAGES: ['credits', 'packages'],
  CREDIT_TRANSACTIONS: ['credits', 'transactions'],
  
  // RBAC
  ROLES: ['rbac', 'roles'],
  ROLE_BY_ID: (id: string) => ['rbac', 'roles', id],
  PERMISSIONS: ['rbac', 'permissions'],
  AUDIT_LOGS: ['rbac', 'auditLogs'],
  
  // Security
  SECURITY_SETTINGS: (tenantId: string) => ['security', 'settings', tenantId],
};

export default queryClient;

