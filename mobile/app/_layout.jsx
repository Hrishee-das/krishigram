import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useAuthStore } from "../utils/authStore";
import "../utils/i18n"; // Import i18n to initialize it

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="create-account" />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
