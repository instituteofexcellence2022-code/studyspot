import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: {
    notifications: boolean
    theme: 'light' | 'dark' | 'system'
  }
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock user data
          const user: User = {
            id: '1',
            email,
            name: email.split('@')[0],
            preferences: {
              notifications: true,
              theme: 'system'
            }
          }
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        })
      },

      updateProfile: (data: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ 
            user: { ...user, ...data } 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)












