/**
 * API Client Tests
 */

import axios from 'axios';
import apiClient from '../../services/apiClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000',
  pathname: '/dashboard',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Request Interceptor', () => {
    it('adds authorization header when token exists', () => {
      const mockToken = 'valid.jwt.token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      const mockConfig = {
        headers: {},
        url: '/api/test',
        method: 'get',
      };

      // Mock the interceptor
      const requestInterceptor = mockedAxios.interceptors.request.use.mock.calls[0][0];
      const result = requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('does not add authorization header when token is null', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockConfig = {
        headers: {},
        url: '/api/test',
        method: 'get',
      };

      const requestInterceptor = mockedAxios.interceptors.request.use.mock.calls[0][0];
      const result = requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('removes invalid token and does not add authorization header', () => {
      const invalidToken = 'invalid-token';
      mockLocalStorage.getItem.mockReturnValue(invalidToken);

      const mockConfig = {
        headers: {},
        url: '/api/test',
        method: 'get',
      };

      const requestInterceptor = mockedAxios.interceptors.request.use.mock.calls[0][0];
      const result = requestInterceptor(mockConfig);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('studyspot_auth_token');
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('handles 401 unauthorized error', () => {
      const mockError = {
        response: { status: 401 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      // Mock window.location.href setter
      const originalHref = window.location.href;
      Object.defineProperty(window.location, 'href', {
        writable: true,
        value: originalHref,
      });

      responseInterceptor(mockError);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('studyspot_auth_token');
    });

    it('handles network error in development mode', () => {
      const mockError = {
        code: 'ECONNREFUSED',
        message: 'Network Error',
      };

      // Set development mode
      process.env.NODE_ENV = 'development';

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      const result = responseInterceptor(mockError);

      expect(result).resolves.toEqual({
        data: {
          success: true,
          message: 'Development mode - API server not available',
          data: {},
        },
      });
    });

    it('handles network error in production mode', () => {
      const mockError = {
        code: 'ECONNREFUSED',
        message: 'Network Error',
      };

      // Set production mode
      process.env.NODE_ENV = 'production';

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Network error: Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: mockError,
      });
    });

    it('handles timeout error', () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Request timeout: The server took too long to respond. Please try again.',
        code: 'TIMEOUT',
        originalError: mockError,
      });
    });

    it('handles 403 forbidden error', () => {
      const mockError = {
        response: { status: 403 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Access forbidden: You do not have permission to perform this action.',
        code: 'FORBIDDEN',
        originalError: mockError,
      });
    });

    it('handles 404 not found error', () => {
      const mockError = {
        response: { status: 404 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Resource not found: The requested data could not be found.',
        code: 'NOT_FOUND',
        originalError: mockError,
      });
    });

    it('handles 500 internal server error', () => {
      const mockError = {
        response: { status: 500 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Internal server error: Something went wrong on the server. Please try again later.',
        code: 'SERVER_ERROR',
        originalError: mockError,
      });
    });

    it('handles generic error with response data', () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Custom error message' },
        },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Custom error message',
        code: 400,
        originalError: mockError,
      });
    });

    it('handles error without response data', () => {
      const mockError = {
        message: 'Generic error',
      };

      const responseInterceptor = mockedAxios.interceptors.response.use.mock.calls[0][1];
      
      expect(() => responseInterceptor(mockError)).rejects.toEqual({
        message: 'Generic error',
        code: 'UNKNOWN_ERROR',
        originalError: mockError,
      });
    });
  });

  describe('Configuration', () => {
    it('has correct base configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        timeout: expect.any(Number),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
});
