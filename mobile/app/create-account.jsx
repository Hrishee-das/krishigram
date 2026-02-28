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

export default function CreateAccountScreen() {
  const { signUpMutation } = useAuth();

  const [nameId, setNameId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSignUp = () => {
    if (nameId && name && password && password === passwordConfirm) {
      signUpMutation.mutate({ nameId, name, password, passwordConfirm });
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
              Krishigram
            </AppText>
          </View>

          <View style={styles.welcomeContainer}>
            <AppText variant="h1" style={styles.title}>
              Create Account
            </AppText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={Color.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Create ID"
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
            <TextInput
              style={styles.input}
              placeholder="re-enter Password"
              placeholderTextColor={Color.textSecondary}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
            />
          </View>
          <AppButton
            title={
              signUpMutation.isPending
                ? "Creating account..."
                : "Create Account"
            }
            onPress={handleSignUp}
            disabled={
              signUpMutation.isPending ||
              !nameId ||
              !name ||
              !password ||
              password !== passwordConfirm
            }
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
  createAccountContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  createText: {
    fontSize: 14,
    color: Color.textSecondary,
  },

  createLink: {
    color: Color.primaryDark,
    fontWeight: "600",
  },
});
