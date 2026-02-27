import { useMutation } from "@tanstack/react-query";
import { loginApi, logoutApi, signUpApi } from "../services/auth";
import { useAuthStore } from "../utils/authStore";

export const useAuth = () => {
  const { logIn, logOut } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      logIn(data.token); // update zustand state
      // optionally store token from data here
      console.log("Login successful:", data.token);
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logOut();
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUpApi,
    onSuccess: (data) => {
      logIn();
    },
  });

  return { loginMutation, logoutMutation, signUpMutation };
};
