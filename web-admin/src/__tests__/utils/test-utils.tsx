/**
 * Test Utilities
 * Custom render function with providers for testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

import { rootReducer } from '../../store';
import { ROUTES } from '../../constants';

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
};

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  store: any;
  queryClient: QueryClient;
  initialEntries?: string[];
}> = ({ children, store, queryClient, initialEntries = ['/'] }) => {
  const persistor = persistStore(store);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={testTheme}>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    queryClient = createTestQueryClient(),
    initialEntries,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders
      store={store}
      queryClient={queryClient}
      initialEntries={initialEntries}
    >
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Mock user data
export const mockUser = {
  id: '1',
  email: 'admin@studyspot.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'super_admin',
  tenantId: 'tenant-1',
  isActive: true,
  permissions: ['read:all', 'write:all', 'admin:system'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock tenant data
export const mockTenant = {
  id: 'tenant-1',
  name: 'Test Library',
  domain: 'test.studyspot.com',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  contactInfo: {
    email: 'contact@testlibrary.com',
    phone: '+1234567890',
  },
  subscriptionPlan: {
    id: 'plan-1',
    name: 'Pro Plan',
  },
  status: 'active' as const,
};

// Mock library data
export const mockLibrary = {
  id: 'lib-1',
  name: 'Main Library',
  address: '123 Library St',
  capacity: 100,
  isActive: true,
  tenantId: 'tenant-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock booking data
export const mockBooking = {
  id: 'booking-1',
  userId: 'user-1',
  seatId: 'seat-1',
  libraryId: 'lib-1',
  startTime: '2024-01-01T09:00:00Z',
  endTime: '2024-01-01T17:00:00Z',
  status: 'confirmed' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock API client
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

// Mock router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  location: {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  },
  match: {
    params: {},
    isExact: true,
    path: '/',
    url: '/',
  },
};

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock window.location
export const mockLocation = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock window.history
export const mockHistory = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  length: 1,
  state: null,
};

// Setup mocks
export const setupMocks = () => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
  });

  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  ) as jest.Mock;
};

// Cleanup mocks
export const cleanupMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { createTestStore, createTestQueryClient };
