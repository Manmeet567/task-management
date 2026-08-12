import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: AuthUser | null;
  access_token: string | null;
  is_authenticated: boolean;

  setAuth: (user: AuthUser, accessToken: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      is_authenticated: false,

      setAuth: (user, accessToken) => {
        set({
          user,
          access_token: accessToken,
          is_authenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          access_token: null,
          is_authenticated: false,
        });
      },
    }),
    {
      name: "task-management-auth",
    },
  ),
);
