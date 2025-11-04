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

// Use mock service for instant testing, real service when backend is ready
const USE_MOCK = true; // Enabled for testing - set to false for production
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
          const currentUser = await activeAuthService.getCurrentUser();
          
          if (currentUser) {
            setState({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            activeAuthService.clearAuth();
            setState({
              user: null,
              isAuthenticated: false,
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
      activeAuthService.clearAuth();
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

      const { user, tokens } = await activeAuthService.login(credentials);

      setState({
        user,
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

  const register = async (data: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await activeAuthService.register(data);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
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

