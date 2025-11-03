# 🎨 Frontend Architecture - StudySpot Admin Portal v2.0

## 📋 **Overview**

**Framework**: React 19.2.0  
**Language**: TypeScript 4.9.5  
**Build Tool**: React Scripts 5.0.1 (CRA) OR Vite 5.4.8  
**UI Library**: Material-UI 7.3.4  
**State Management**: Redux Toolkit 2.9.1 + Redux Persist  
**Routing**: React Router DOM 7.9.4  
**Data Fetching**: Axios 1.12.2 + React Query (Optional)

---

## 🏗️ **Complete Frontend Structure**

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
│       ├── images/
│       │   ├── logo.png
│       │   ├── logo-dark.png
│       │   └── placeholder.png
│       └── fonts/
│
├── src/
│   ├── main.tsx                    # Entry point (Vite) OR index.tsx (CRA)
│   ├── App.tsx                     # Root component
│   ├── App.css                     # Root styles
│   │
│   ├── config/                     # Configuration
│   │   ├── constants.ts           # App constants
│   │   ├── environment.ts         # Environment variables
│   │   ├── routes.ts              # Route paths
│   │   └── theme.ts               # MUI theme configuration
│   │
│   ├── types/                      # Global TypeScript types
│   │   ├── index.ts               # Export all types
│   │   ├── api.ts                 # API types
│   │   ├── auth.ts                # Auth types
│   │   ├── common.ts              # Common types
│   │   ├── response.ts            # API response types
│   │   └── models/                # Data models
│   │       ├── User.ts
│   │       ├── Tenant.ts
│   │       ├── Subscription.ts
│   │       └── [All models...]
│   │
│   ├── api/                        # API Layer
│   │   ├── client.ts              # Axios instance
│   │   ├── endpoints.ts           # API endpoints
│   │   ├── interceptors.ts        # Request/Response interceptors
│   │   └── services/              # API services
│   │       ├── auth.service.ts
│   │       ├── tenant.service.ts
│   │       ├── user.service.ts
│   │       ├── revenue.service.ts
│   │       ├── credit.service.ts
│   │       └── [All services...]
│   │
│   ├── store/                      # Redux Store
│   │   ├── index.ts               # Store configuration
│   │   ├── hooks.ts               # Typed hooks (useAppDispatch, useAppSelector)
│   │   ├── rootReducer.ts         # Root reducer
│   │   └── slices/                # Redux slices
│   │       ├── authSlice.ts       # Auth state
│   │       ├── uiSlice.ts         # UI state (sidebar, theme)
│   │       ├── tenantSlice.ts     # Tenant state
│   │       ├── userSlice.ts       # User state
│   │       ├── notificationSlice.ts
│   │       └── settingsSlice.ts
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useTenant.ts           # Tenant context hook
│   │   ├── usePermissions.ts      # RBAC permissions hook
│   │   ├── useDebounce.ts         # Debounce hook
│   │   ├── useLocalStorage.ts     # LocalStorage hook
│   │   ├── useMediaQuery.ts       # Responsive hook
│   │   ├── useToast.ts            # Toast notifications hook
│   │   ├── usePagination.ts       # Pagination hook
│   │   ├── useSearch.ts           # Search hook
│   │   └── useFilter.ts           # Filter hook
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── formatters.ts          # Format currency, date, number
│   │   ├── validators.ts          # Form validators
│   │   ├── storage.ts             # LocalStorage utilities
│   │   ├── helpers.ts             # Helper functions
│   │   ├── constants.ts           # Constants
│   │   ├── errorHandlers.ts       # Error handling
│   │   └── calculations.ts        # Business calculations
│   │
│   ├── contexts/                   # React Contexts
│   │   ├── AuthContext.tsx        # Auth context
│   │   ├── TenantContext.tsx      # Tenant context
│   │   ├── ThemeContext.tsx       # Theme context
│   │   └── NotificationContext.tsx
│   │
│   ├── components/                 # Shared Components
│   │   │
│   │   ├── common/                # Common UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── NumberInput.tsx
│   │   │   │   ├── DateInput.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Table/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── TablePagination.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Card/
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── KPICard.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Loading/
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── ErrorBoundary/
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── EmptyState/
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── FilterPanel/
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Pagination/
│   │   │   │   ├── Pagination.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Tabs/
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Dropdown/
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Alert/
│   │   │   │   ├── Alert.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── Toast/
│   │   │       ├── Toast.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── NavItem.tsx
│   │   │   │   ├── NavGroup.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Breadcrumbs/
│   │   │   │   ├── Breadcrumbs.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── MainLayout/
│   │   │       ├── MainLayout.tsx
│   │   │       ├── AuthLayout.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── charts/                # Chart components
│   │   │   ├── LineChart/
│   │   │   │   ├── LineChart.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── BarChart/
│   │   │   │   ├── BarChart.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── PieChart/
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── AreaChart/
│   │   │   │   ├── AreaChart.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── ComposedChart/
│   │   │       ├── ComposedChart.tsx
│   │   │       └── index.ts
│   │   │
│   │   └── forms/                 # Form components
│   │       ├── LoginForm/
│   │       ├── TenantForm/
│   │       ├── UserForm/
│   │       └── [All forms...]
│   │
│   ├── modules/                    # Feature Modules (25+ modules)
│   │   │
│   │   ├── auth/                  # Authentication Module
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   └── ResetPasswordPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── PasswordField.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── dashboard/             # Dashboard Module
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   └── Charts/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── tenants/               # Tenant Management Module
│   │   │   ├── pages/
│   │   │   │   ├── TenantListPage.tsx
│   │   │   │   ├── TenantDetailsPage.tsx
│   │   │   │   ├── CreateTenantPage.tsx
│   │   │   │   ├── EditTenantPage.tsx
│   │   │   │   ├── TenantOnboardingPage.tsx
│   │   │   │   ├── TenantSettingsPage.tsx
│   │   │   │   └── TenantBrandingPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TenantCard.tsx
│   │   │   │   ├── OnboardingWizard.tsx
│   │   │   │   ├── TenantStats.tsx
│   │   │   │   └── SettingsForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTenants.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── platform-users/        # Platform Users Module
│   │   │   ├── pages/
│   │   │   │   └── PlatformUsersPage.tsx (6 tabs)
│   │   │   ├── components/
│   │   │   │   ├── UserCard.tsx
│   │   │   │   ├── UserDetailsModal.tsx
│   │   │   │   └── UserAnalytics.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── admin-users/           # Admin Users Module
│   │   │   ├── pages/
│   │   │   │   └── AdminUsersPage.tsx (4 tabs)
│   │   │   ├── components/
│   │   │   │   ├── AdminCard.tsx
│   │   │   │   └── PermissionMatrix.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── revenue/               # Revenue & Billing Module
│   │   │   ├── pages/
│   │   │   │   ├── RevenueDashboard.tsx
│   │   │   │   ├── SubscriptionPlansPage.tsx
│   │   │   │   ├── InvoicesPage.tsx
│   │   │   │   ├── PaymentMethodsPage.tsx
│   │   │   │   ├── DunningManagementPage.tsx
│   │   │   │   └── RevenueAnalyticsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── PlanCard.tsx
│   │   │   │   ├── InvoiceCard.tsx
│   │   │   │   └── RevenueChart.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── credits/               # Credit Management Module
│   │   │   ├── pages/
│   │   │   │   └── CreditManagementPage.tsx (4 tabs)
│   │   │   ├── components/
│   │   │   │   ├── WalletCard.tsx
│   │   │   │   └── CreditChart.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── subscriptions/         # Subscription Management Module
│   │   │   ├── pages/
│   │   │   │   └── SubscriptionManagementPage.tsx (5 tabs)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── payments/              # Payment Management Module
│   │   │   ├── pages/
│   │   │   │   └── PaymentManagementPage.tsx (6 tabs)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   └── [20+ more modules...]
│   │
│   ├── routes/                     # Routing Configuration
│   │   ├── index.tsx              # Main routes
│   │   ├── ProtectedRoute.tsx     # Protected route wrapper
│   │   ├── PublicRoute.tsx        # Public route wrapper
│   │   └── routeConfig.ts         # Route configuration
│   │
│   ├── styles/                     # Global Styles
│   │   ├── global.css             # Global CSS
│   │   ├── variables.css          # CSS variables
│   │   ├── mixins.ts              # Styled component mixins
│   │   └── animations.css         # CSS animations
│   │
│   └── __tests__/                 # Tests
│       ├── unit/                  # Unit tests
│       ├── integration/           # Integration tests
│       └── e2e/                   # E2E tests (Playwright)
│
├── .env.example
├── .env.development
├── .env.production
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🎨 **Material-UI Theme Configuration**

```typescript
// src/config/theme.ts

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
```

---

## 🔧 **Redux Store Configuration**

```typescript
// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'studyspot-admin',
  version: 1,
  storage,
  whitelist: ['auth', 'ui', 'settings'], // Only persist these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// src/store/hooks.ts

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 🌐 **API Client Configuration**

```typescript
// src/api/client.ts

import axios from 'axios';
import { toast } from 'react-toastify';
import { storage } from '@/utils/storage';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = storage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID
    const tenantId = storage.get('current_tenant_id');
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = storage.getRefreshToken();
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        storage.setAuthToken(accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        storage.clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'An error occurred';
    
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 **Protected Route Component**

```typescript
// src/routes/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

---

## 📱 **Responsive Design Strategy**

### **Breakpoints (MUI):**
```typescript
{
  xs: 0,      // Mobile (0-600px)
  sm: 600,    // Tablet (600-960px)
  md: 960,    // Desktop (960-1280px)
  lg: 1280,   // Large Desktop (1280-1920px)
  xl: 1920,   // Extra Large (1920px+)
}
```

### **Responsive Sidebar:**
```typescript
// Drawer width based on screen size
const drawerWidth = {
  xs: '100%',     // Full width on mobile
  sm: 240,        // Fixed width on tablet
  md: 260,        // Fixed width on desktop
  lg: 280,        // Fixed width on large desktop
};
```

---

## ⚡ **Performance Optimization**

### **1. Code Splitting:**
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./modules/dashboard/pages/DashboardPage'));
const Tenants = lazy(() => import('./modules/tenants/pages/TenantListPage'));
const Revenue = lazy(() => import('./modules/revenue/pages/RevenueDashboard'));

// Lazy load components
const HeavyChart = lazy(() => import('./components/charts/HeavyChart'));
```

### **2. Memoization:**
```typescript
// Memo heavy components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.value - a.value);
}, [data]);

// useCallback for functions
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

### **3. Virtual Scrolling:**
```typescript
// For large lists (1000+ items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
```

---

## 🧪 **Testing Strategy**

### **Unit Tests (Jest + Testing Library):**
```typescript
// Component test
describe('KPICard', () => {
  it('renders title and value correctly', () => {
    render(<KPICard title="MRR" value="₹48.5L" />);
    
    expect(screen.getByText('MRR')).toBeInTheDocument();
    expect(screen.getByText('₹48.5L')).toBeInTheDocument();
  });
});

// Hook test
describe('useAuth', () => {
  it('returns user when authenticated', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

### **Integration Tests:**
```typescript
// API integration test
describe('Tenant API', () => {
  it('fetches tenants successfully', async () => {
    const tenants = await tenantService.getTenants();
    
    expect(tenants).toHaveLength(10);
    expect(tenants[0]).toHaveProperty('id');
    expect(tenants[0]).toHaveProperty('name');
  });
});
```

### **E2E Tests (Playwright):**
```typescript
// E2E test
test('login flow', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  await page.fill('[name="email"]', 'admin@studyspot.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 🎯 **State Management Pattern**

### **Redux Slice Example:**
```typescript
// src/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

---

## 📊 **Component Patterns**

### **Container/Presenter Pattern:**
```typescript
// Container (logic)
const TenantListContainer = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const data = await tenantService.getTenants();
    setTenants(data);
    setLoading(false);
  };

  return <TenantListPresenter tenants={tenants} loading={loading} />;
};

// Presenter (UI)
const TenantListPresenter = ({ tenants, loading }) => {
  if (loading) return <Spinner />;
  
  return (
    <Grid container spacing={2}>
      {tenants.map(tenant => (
        <Grid item xs={12} sm={6} md={4} key={tenant.id}>
          <TenantCard tenant={tenant} />
        </Grid>
      ))}
    </Grid>
  );
};
```

---

## 🚀 **Build & Deployment**

### **Build Commands:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

### **Environment Variables:**
```env
REACT_APP_API_URL=https://api.studyspot.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0
REACT_APP_SENTRY_DSN=https://...
```

---

**Last Updated**: October 31, 2025  
**Status**: ✅ **COMPLETE**  
**Framework**: React 19.2.0 + TypeScript 4.9.5 + MUI 7.3.4


