import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthState } from './types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      signin: (user: User, accessToken: string) => {
        set({ user, accessToken, isLoggedIn: true })
      },
      setAccessToken: (accessToken: string) => {
        set({ accessToken })
      },
      logout: () => {
        set({ user: null, accessToken: null, isLoggedIn: false })
      },
    }),
    {
      name: 'ai-interview-user',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
