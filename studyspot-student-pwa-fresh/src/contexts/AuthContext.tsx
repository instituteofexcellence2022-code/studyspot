import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authClient, tokenStorage } from '../services/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const tokens = tokenStorage.read()
      if (tokens?.accessToken) {
        // Verify token and get user
        // TODO: Call /api/auth/me endpoint
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.login({ email, password })
      if (response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      // TODO: Implement registration
      console.log('Register:', data)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authClient.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


