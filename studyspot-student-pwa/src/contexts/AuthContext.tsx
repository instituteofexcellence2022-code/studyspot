import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { mockAuthService } from '../services/mock-auth.service';
import type { 
  AuthContextType, 
  User, 
  LoginRequest, 
  RegisterRequest,
  AuthState 
} from '../types/auth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const activeAuthService = USE_MOCK ? mockAuthService : authService;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const user = activeAuthService.getUser();
      const token = activeAuthService.getToken();

      if (user && token) {
        // In mock mode, just use stored user. In real mode, verify with backend
        if (USE_MOCK) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
          );
          
          try {
            const currentUser = await Promise.race([
              activeAuthService.getCurrentUser(),
              timeoutPromise
            ]);
            
            if (currentUser) {
              setState({
                user: currentUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // Token invalid, use cached user but mark for re-auth
              console.warn('Token validation failed, using cached user');
              setState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } catch (verifyError) {
            // Backend unreachable, use cached user
            console.warn('Backend unreachable, using cached credentials');
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Don't clear auth on init error, just log it
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await activeAuthService.login(credentials);
      
      // Validate response structure
      if (!response) {
        throw new Error('Login failed: No response received');
      }
      
      if (!response.user) {
        console.error('[AuthContext] Login response missing user:', response);
        throw new Error('Login failed: User data not found');
      }
      
      if (!response.tokens || !response.tokens.accessToken) {
        console.error('[AuthContext] Login response missing tokens:', response);
        throw new Error('Login failed: Access token not found');
      }

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed. Please try again.',
      }));
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await activeAuthService.register(data);

      // Auto-login after successful registration
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const logout = () => {
    activeAuthService.logout().finally(() => {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const updateUser = (updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      activeAuthService.updateUser(updates);
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

