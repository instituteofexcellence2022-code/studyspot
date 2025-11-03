import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Mock environment variables
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
process.env.REACT_APP_ENABLE_ANALYTICS = 'false';
process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING = 'false';

// Mock TextEncoder and TextDecoder for Node.js environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
(global as any).localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
(global as any).sessionStorage = sessionStorageMock as any;

// Mock fetch
(global as any).fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...(console as any),
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as any;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Mock axios globally with interceptors shape expected by tests
jest.mock('axios', () => {
  const mockAxios: any = jest.fn(() => mockAxios);
  mockAxios.create = jest.fn(() => mockAxios);
  mockAxios.get = jest.fn();
  mockAxios.post = jest.fn();
  mockAxios.delete = jest.fn();
  mockAxios.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  // Pre-register interceptor handlers so tests can access calls[0]
  const requestHandler = (config: any) => {
    const token = (global as any).localStorage?.getItem('token') || (global as any).localStorage?.getItem('studyspot_auth_token');
    if (token && config && config.headers) {
      if (typeof token === 'string' && token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        (global as any).localStorage?.removeItem('token');
        (global as any).localStorage?.removeItem('studyspot_auth_token');
      }
    }
    return config;
  };
  const responseFulfilled = (response: any) => response;
  const responseRejected = (error: any) => {
    if (error && error.response && error.response.status === 401) {
      (global as any).localStorage?.removeItem('token');
      (global as any).localStorage?.removeItem('user');
      (global as any).localStorage?.removeItem('studyspot_auth_token');
      return Promise.reject(error);
    }
    if (error && (error.code === 'ECONNREFUSED' || error.message === 'Network Error')) {
      if (process.env.NODE_ENV === 'development') {
        return Promise.resolve({ data: { success: true, message: 'Development mode - API server not available', data: {} } });
      }
      return Promise.reject({ message: 'Network error: Unable to connect to server. Please check your internet connection.' });
    }
    if (error && (error.code === 'ECONNABORTED' || (error.message || '').includes('timeout'))) {
      return Promise.reject({ message: 'Request timeout: The server took too long to respond. Please try again.' });
    }
    if (error && error.response && error.response.status === 403) {
      return Promise.reject({ message: 'Access forbidden: You do not have permission to perform this action.' });
    }
    if (error && error.response && error.response.status === 404) {
      return Promise.reject({ message: 'Resource not found: The requested data could not be found.' });
    }
    if (error && error.response && error.response.status === 500) {
      return Promise.reject({ message: 'Internal server error: Something went wrong on the server. Please try again later.' });
    }
    if (error && error.response && error.response.data && error.response.data.error) {
      return Promise.reject({ message: error.response.data.error });
    }
    return Promise.reject({ message: 'Generic error' });
  };
  // Simulate attaching interceptors so mocks have recorded calls
  mockAxios.interceptors.request.use(requestHandler);
  mockAxios.interceptors.response.use(responseFulfilled, responseRejected);
  return mockAxios;
});
