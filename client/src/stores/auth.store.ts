import { create } from "zustand";

export type AuthUser = {
  facilityId: string | null;
  name: string;
  permissions: string[];
  roles: string[];
  userId: string;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));