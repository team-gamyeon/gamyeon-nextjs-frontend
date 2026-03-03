import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthState } from "./types";

const MOCK_USER: User = {
  name: "홍길동",
  email: "hong@example.com",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      signin: (u: User = MOCK_USER) => {
        set({ user: u, isLoggedIn: true });
      },
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: "ai-interview-user",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
