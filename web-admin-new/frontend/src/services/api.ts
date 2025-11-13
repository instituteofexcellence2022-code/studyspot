// ============================================
// API SERVICE
// Centralized API client for backend communication
// ============================================

import { apiClient } from './sdk';

const api = apiClient;

type RequestConfig = Parameters<typeof api.get>[1];

export const apiService = {
  get<T = any>(url: string, config?: RequestConfig) {
    return api.get<T>(url, config);
  },

  post<T = any>(url: string, data?: any, config?: RequestConfig) {
    return api.post<T>(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: RequestConfig) {
    return api.put<T>(url, data, config);
  },

  patch<T = any>(url: string, data?: any, config?: RequestConfig) {
    return api.patch<T>(url, data, config);
  },

  delete<T = any>(url: string, config?: RequestConfig) {
    return api.delete<T>(url, config);
  },

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  auth: {
    login: (email: string, password: string) =>
      api.post('/auth/admin/login', { email, password }),

    logout: () => api.post('/auth/logout'),

    refreshToken: (refreshToken: string) =>
      api.post('/auth/refresh', { refreshToken }),

    verifyToken: () => api.post('/auth/verify'),

    getProfile: () => api.get('/auth/profile'),
  },

  // ============================================
  // TENANT ENDPOINTS
  // ============================================
  tenants: {
    getAll: (params?: any) => api.get('/tenants', { params }),

    getById: (id: string) => api.get(`/tenants/${id}`),

    create: (data: any) => api.post('/tenants', data),

    update: (id: string, data: any) => api.put(`/tenants/${id}`, data),

    delete: (id: string) => api.delete(`/tenants/${id}`),

    suspend: (id: string, reason: string) =>
      api.post(`/tenants/${id}/suspend`, { reason }),

    reactivate: (id: string) => api.post(`/tenants/${id}/reactivate`),

    getStats: (id: string) => api.get(`/tenants/${id}/stats`),
  },

  // ============================================
  // USER ENDPOINTS
  // ============================================
  users: {
    getAll: (params?: any) => api.get('/admin/users', { params }),

    getById: (id: string) => api.get(`/admin/users/${id}`),

    create: (data: any) => api.post('/admin/users', data),

    update: (id: string, data: any) => api.put(`/admin/users/${id}`, data),

    delete: (id: string) => api.delete(`/admin/users/${id}`),

    getActivity: (id: string) => api.get(`/admin/users/${id}/activity`),

    updatePassword: (id: string, password: string) =>
      api.put(`/admin/users/${id}/password`, { password }),
  },

  // ============================================
  // STUDENT ENDPOINTS
  // ============================================
  students: {
    getAll: (params?: any) => api.get('/students', { params }),

    getById: (id: string) => api.get(`/students/${id}`),

    create: (data: any) => api.post('/students', data),

    update: (id: string, data: any) => api.put(`/students/${id}`, data),

    delete: (id: string) => api.delete(`/students/${id}`),

    bulkImport: (students: any[]) =>
      api.post('/students/bulk-import', { students }),

    getAnalytics: () => api.get('/students/analytics'),

    getAttendance: (id: string) => api.get(`/students/${id}/attendance`),

    getPayments: (id: string) => api.get(`/students/${id}/payments`),

    suspend: (id: string, reason: string) =>
      api.post(`/students/${id}/suspend`, { reason }),

    reactivate: (id: string) => api.post(`/students/${id}/reactivate`),
  },

  // ============================================
  // LIBRARY ENDPOINTS
  // ============================================
  libraries: {
    getAll: (params?: any) => api.get('/libraries', { params }),

    getById: (id: string) => api.get(`/libraries/${id}`),

    create: (data: any) => api.post('/libraries', data),

    update: (id: string, data: any) => api.put(`/libraries/${id}`, data),

    delete: (id: string) => api.delete(`/libraries/${id}`),

    getRealTimeOccupancy: () => api.get('/libraries/realtime-occupancy'),
  },

  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================
  payments: {
    create: (data: any) => api.post('/payments/create', data),

    verify: (orderId: string, paymentId: string, signature: string) =>
      api.post('/payments/verify', { orderId, paymentId, signature }),

    refund: (id: string, amount: number, reason: string) =>
      api.post(`/payments/${id}/refund`, { amount, reason }),

    getHistory: (params?: any) => api.get('/payments', { params }),
  },

  // ============================================
  // CREDIT ENDPOINTS
  // ============================================
  credits: {
    getMasterWallet: () => api.get('/admin/credits/wallet'),

    purchaseCredits: (data: any) => api.post('/admin/credits/purchase', data),

    getTenantWallets: (params?: any) =>
      api.get('/admin/credits/tenant-wallets', { params }),

    allocateCredits: (data: any) => api.post('/admin/credits/allocate', data),

    getWallet: () => api.get('/credits/wallet'),

    deductCredits: (data: any) => api.post('/credits/deduct', data),
  },

  // ============================================
  // SUBSCRIPTION ENDPOINTS
  // ============================================
  subscriptions: {
    getPlans: (params?: any) => api.get('/admin/subscriptions/plans', { params }),

    createPlan: (data: any) => api.post('/admin/subscriptions/plans', data),

    subscribe: (planId: string, billingCycle: string) =>
      api.post('/subscriptions/subscribe', { plan_id: planId, billing_cycle: billingCycle }),

    cancel: (id: string, reason: string) =>
      api.post(`/subscriptions/${id}/cancel`, { reason }),

    getAnalytics: () => api.get('/admin/subscriptions/analytics'),
  },

  // ============================================
  // MESSAGING ENDPOINTS
  // ============================================
  messaging: {
    sendSMS: (phone: string, templateType: string, variables: string[]) =>
      api.post('/messaging/sms', { phone, templateType, variables }),

    sendOTP: (phone: string) => api.post('/messaging/send-otp', { phone }),

    verifyOTP: (phone: string, otp: string) =>
      api.post('/messaging/verify-otp', { phone, otp }),

    getHistory: (params?: any) => api.get('/messaging/history', { params }),

    getAnalytics: () => api.get('/messaging/analytics'),
  },

  // ============================================
  // ANALYTICS ENDPOINTS
  // ============================================
  analytics: {
    getExecutive: () => api.get('/analytics/executive'),

    getRevenue: (params?: any) => api.get('/analytics/revenue', { params }),

    getUsers: () => api.get('/analytics/users'),

    getDashboard: () => api.get('/analytics/dashboard'),
  },

  // ============================================
  // HEALTH CHECK
  // ============================================
  health: {
    gateway: () => api.get('/health', { baseURL: 'http://localhost:3000' }),

    allServices: () => api.get('/health/all'),
  },
};

export default apiService;

