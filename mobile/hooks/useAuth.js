import { useMutation } from "@tanstack/react-query";
import { loginApi, logoutApi, signUpApi } from "../services/auth";
import { useAuthStore } from "../utils/authStore";

export const useAuth = () => {
  const { logIn, logOut } = useAuthStore();

  // ───────── LOGIN ─────────
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // Support multiple backend response structures safely
      const token = data?.token || data?.data?.token;

      const userObj = data?.user || data?.data?.user;

      // Update zustand state (supports both old & new logIn signatures)
      logIn(token, userObj);
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });

  // ───────── LOGOUT ─────────
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logOut();
    },
  });

  // ───────── SIGNUP ─────────
  const signUpMutation = useMutation({
    mutationFn: signUpApi,
    onSuccess: (data) => {
      const token = data?.token || data?.data?.token;

      const userObj = data?.user || data?.data?.user;

      // Supports both previous and updated implementation
      logIn(token, userObj);
    },
  });

  return { loginMutation, logoutMutation, signUpMutation };
};
