// ============================================
// TYPE DEFINITIONS
// ============================================

export type UserRole = 'super_admin' | 'admin' | 'support' | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  tenantName?: string;
  avatarUrl?: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  details?: any;
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
}

export interface UIState {
  sidebarOpen: boolean;
  themeMode: 'light' | 'dark';
  notifications: Notification[];
  snackbar: SnackbarState;
  loading: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  email: string;
  phone?: string;
  address?: string;
  plan?: string;
  subscriptionPlan: string;
  subscriptionStatus?: 'trial' | 'active' | 'cancelled' | 'expired';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  logo?: string;
  metadata?: {
    librariesCount?: number;
    usersCount?: number;
    seatsCount?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}
