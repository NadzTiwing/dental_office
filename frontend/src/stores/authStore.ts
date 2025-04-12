import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login as apiLogin, LoginResponse } from '../services/api'

interface AuthState {
  isAuthenticated: boolean
  user: LoginResponse | null
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, password: string) => {
        try {
          const response = await apiLogin(email, password)
          set({ isAuthenticated: true, user: response })
          return response
        } catch (error) {
          throw error
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null })
      },
    }),
    {
      name: 'auth-storage',
      // Use sessionStorage instead of localStorage
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str)
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
) 