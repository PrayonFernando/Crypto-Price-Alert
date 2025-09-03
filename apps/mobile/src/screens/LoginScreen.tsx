import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginForm } from "../validation/auth";

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data.email, data.password);
      // AuthProvider switches stack -> to tabs
    } catch (e: any) {
      const msg = String(e?.message || "Login failed");
      Alert.alert("Login failed", normalizeAuthError(msg));
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 16,
        }}
      >
        Welcome back
      </Text>

      <Text style={{ color: colors.text, marginBottom: 6 }}>Email</Text>
      <TextInput
        {...register("email")}
        onChangeText={(t) => setValue("email", t, { shouldValidate: true })}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor="#555"
        style={fieldStyle}
      />
      {errors.email && <Text style={errStyle}>{errors.email.message}</Text>}

      <Text style={{ color: colors.text, marginTop: 12, marginBottom: 6 }}>
        Password
      </Text>
      <TextInput
        {...register("password")}
        onChangeText={(t) => setValue("password", t, { shouldValidate: true })}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor="#555"
        style={fieldStyle}
      />
      {errors.password && (
        <Text style={errStyle}>{errors.password.message}</Text>
      )}

      <View style={{ height: 16 }} />
      <Button
        title={isSubmitting ? "Signing in..." : "Sign in"}
        onPress={onSubmit}
        disabled={isSubmitting}
      />

      <View style={{ height: 16 }} />
      <Text
        onPress={() => nav.navigate("Signup")}
        style={{ color: colors.accent, textAlign: "center" }}
      >
        Need an account? Sign up
      </Text>
    </KeyboardAvoidingView>
  );
}

const fieldStyle = {
  color: "#fff",
  borderColor: "#222",
  borderWidth: 1,
  borderRadius: 8,
  padding: 12,
};

const errStyle = { color: "#f66", marginTop: 4 };

function normalizeAuthError(msg: string) {
  if (/401/.test(msg) || /Invalid credentials/i.test(msg))
    return "Invalid email or password.";
  if (/Network/i.test(msg)) return "Network error. Check your connection.";
  return msg;
}
