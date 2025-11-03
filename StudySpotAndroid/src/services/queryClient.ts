/**
 * StudySpot Mobile App - React Query Configuration
 * Enhanced data fetching with caching and synchronization
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Persist cache to AsyncStorage
export const persistQueryClient = async () => {
  try {
    const cacheData = queryClient.getQueryCache();
    await AsyncStorage.setItem('react-query-cache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to persist query cache:', error);
  }
};

// Restore cache from AsyncStorage
export const restoreQueryClient = async () => {
  try {
    const cachedData = await AsyncStorage.getItem('react-query-cache');
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      queryClient.setQueryData(['persisted'], parsedData);
    }
  } catch (error) {
    console.error('Failed to restore query cache:', error);
  }
};

// Query keys for consistent caching
export const queryKeys = {
  // User queries
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', userId] as const,
  
  // Library queries
  libraries: ['libraries'] as const,
  library: (libraryId: string) => ['library', libraryId] as const,
  libraryAvailability: (libraryId: string, date: string) => 
    ['library', libraryId, 'availability', date] as const,
  
  // Booking queries
  bookings: ['bookings'] as const,
  userBookings: (userId: string) => ['bookings', userId] as const,
  booking: (bookingId: string) => ['booking', bookingId] as const,
  
  // Payment queries
  payments: ['payments'] as const,
  userPayments: (userId: string) => ['payments', userId] as const,
  
  // Analytics queries
  analytics: ['analytics'] as const,
  userAnalytics: (userId: string) => ['analytics', userId] as const,
  
  // Notification queries
  notifications: ['notifications'] as const,
  userNotifications: (userId: string) => ['notifications', userId] as const,
};

// Custom hooks for common queries
export const useUserQuery = (userId: string) => {
  return queryClient.useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });
};

export const useLibrariesQuery = () => {
  return queryClient.useQuery({
    queryKey: queryKeys.libraries,
    queryFn: fetchLibraries,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useLibraryQuery = (libraryId: string) => {
  return queryClient.useQuery({
    queryKey: queryKeys.library(libraryId),
    queryFn: () => fetchLibrary(libraryId),
    enabled: !!libraryId,
  });
};

export const useBookingsQuery = (userId: string) => {
  return queryClient.useQuery({
    queryKey: queryKeys.userBookings(userId),
    queryFn: () => fetchUserBookings(userId),
    enabled: !!userId,
  });
};

// Placeholder API functions (replace with actual implementations)
const fetchUserProfile = async (userId: string) => {
  // Implementation will connect to your microservices
  throw new Error('fetchUserProfile not implemented');
};

const fetchLibraries = async () => {
  // Implementation will connect to your microservices
  throw new Error('fetchLibraries not implemented');
};

const fetchLibrary = async (libraryId: string) => {
  // Implementation will connect to your microservices
  throw new Error('fetchLibrary not implemented');
};

const fetchUserBookings = async (userId: string) => {
  // Implementation will connect to your microservices
  throw new Error('fetchUserBookings not implemented');
};

export default queryClient;
