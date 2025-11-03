/**
 * React Query Hooks for API Calls
 * Provides typed hooks for data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { QueryKeys } from '../config/react-query';
import { apiService } from '../services/api';
import { API_CONFIG } from '../types';

/**
 * Typed API Error
 */
export interface ApiError {
  message: string;
  code: string;
  originalError?: any;
}

/**
 * Generic hook for fetching data
 */
export function useApiQuery<TData = unknown, TError = ApiError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const response = await apiService.get<TData>(endpoint);
      return response;
    },
    ...options,
  });
}

/**
 * Generic mutation hook
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const queryClient = useQueryClient();
  
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // Invalidate related queries on success
      options?.onSuccess?.(data, variables, context);
    },
  });
}

/**
 * User hooks
 */
export function useUsers(options?: any) {
  return useApiQuery(QueryKeys.USERS, API_CONFIG.ENDPOINTS.USERS.LIST, options);
}

export function useUser(userId: string) {
  return useApiQuery(
    QueryKeys.USER_BY_ID(userId),
    API_CONFIG.ENDPOINTS.USERS.BY_ID.replace(':id', userId),
    { enabled: !!userId }
  );
}

/**
 * Library hooks
 */
export function useLibraries(options?: any) {
  return useApiQuery(QueryKeys.LIBRARIES, API_CONFIG.ENDPOINTS.LIBRARIES.LIST, options);
}

export function useLibrary(libraryId: string) {
  return useApiQuery(
    QueryKeys.LIBRARY_BY_ID(libraryId),
    API_CONFIG.ENDPOINTS.LIBRARIES.BY_ID.replace(':id', libraryId),
    { enabled: !!libraryId }
  );
}

/**
 * Booking hooks
 */
export function useBookings(options?: any) {
  return useApiQuery(QueryKeys.BOOKINGS, API_CONFIG.ENDPOINTS.BOOKINGS.LIST, options);
}

export function useBooking(bookingId: string) {
  return useApiQuery(
    QueryKeys.BOOKING_BY_ID(bookingId),
    API_CONFIG.ENDPOINTS.BOOKINGS.BY_ID.replace(':id', bookingId),
    { enabled: !!bookingId }
  );
}

/**
 * Tenant hooks
 */
export function useTenants(options?: any) {
  return useApiQuery(QueryKeys.TENANTS, API_CONFIG.ENDPOINTS.TENANTS.LIST, options);
}

export function useTenant(tenantId: string) {
  return useApiQuery(
    QueryKeys.TENANT_BY_ID(tenantId),
    API_CONFIG.ENDPOINTS.TENANTS.BY_ID.replace(':id', tenantId),
    { enabled: !!tenantId }
  );
}

/**
 * Subscription hooks
 */
export function useSubscriptions(options?: any) {
  return useApiQuery(QueryKeys.SUBSCRIPTIONS, API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.LIST, options);
}

/**
 * Credit hooks
 */
export function useCreditBalance(options?: any) {
  return useApiQuery(QueryKeys.CREDIT_BALANCE, '/api/credits/balance', options);
}

/**
 * Generic mutation hooks
 */
export function useCreateMutation(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    async (data: any) => {
      const response = await apiService.post(endpoint, data);
      return response;
    },
    {
      onSuccess: () => {
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey });
      },
    }
  );
}

export function useUpdateMutation(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await apiService.put(endpoint.replace(':id', id), data);
      return response;
    },
    {
      onSuccess: () => {
        // Invalidate both list and detail queries
        queryClient.invalidateQueries({ queryKey });
      },
    }
  );
}

export function useDeleteMutation(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    async (id: string) => {
      const response = await apiService.delete(endpoint.replace(':id', id));
      return response;
    },
    {
      onSuccess: () => {
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey });
      },
    }
  );
}

export default {
  useApiQuery,
  useApiMutation,
  useUsers,
  useUser,
  useLibraries,
  useLibrary,
  useBookings,
  useBooking,
  useTenants,
  useTenant,
  useSubscriptions,
  useCreditBalance,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
};

