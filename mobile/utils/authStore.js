import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      user: null,
      shouldCreateAccount: false,

      logIn: (token, user = null) => {
        set({ isLoggedIn: true, token, user });
      },

      setUser: (user) => {
        set({ user });
      },

      logOut: () => {
        set({ isLoggedIn: false, token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const value = await SecureStore.getItemAsync(name);
          return value ?? null;
        },
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, value);
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      })),
    },
  ),
);
