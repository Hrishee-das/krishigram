import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../hooks/useAuth";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import Color from "@/constants/color";

export default function SignInScreen() {
  const { loginMutation } = useAuth();

  const [nameId, setNameId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (nameId && password) {
      loginMutation.mutate({ nameId, password });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require("../assets/images/krisheegram.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <AppText variant="h1" style={styles.brandName}>
              Krisheegram
            </AppText>
          </View>

          <View style={styles.welcomeContainer}>
            <AppText variant="h1" style={styles.title}>
              Log In
            </AppText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username or ID"
              placeholderTextColor={Color.textSecondary}
              value={nameId}
              onChangeText={setNameId}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Color.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <AppButton
            title={loginMutation.isPending ? "Logging in..." : "Log In"}
            onPress={handleLogin}
            disabled={loginMutation.isPending || !nameId || !password}
            fullWidth={true}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 12,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "700",
    color: Color.primaryDark,
    letterSpacing: -0.5,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    textAlign: "left",
    fontSize: 24,
    fontWeight: "bold",
    color: Color.black,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "left",
    color: Color.textSecondary,
    fontSize: 15,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 18,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Color.divider,
    borderRadius: 10,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: Color.white,
    color: Color.black,
  },
});
