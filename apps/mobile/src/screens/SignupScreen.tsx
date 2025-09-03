import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupForm } from "../validation/auth";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signup(data.email, data.password);
    } catch (e: any) {
      const msg = String(e?.message || "Signup failed");
      Alert.alert("Signup failed", normalizeSignupError(msg));
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
        Create your account
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

      <Text style={{ color: colors.text, marginTop: 12, marginBottom: 6 }}>
        Confirm password
      </Text>
      <TextInput
        {...register("confirm")}
        onChangeText={(t) => setValue("confirm", t, { shouldValidate: true })}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor="#555"
        style={fieldStyle}
      />
      {errors.confirm && <Text style={errStyle}>{errors.confirm.message}</Text>}

      <View style={{ height: 16 }} />
      <Button
        title={isSubmitting ? "Creating..." : "Create account"}
        onPress={onSubmit}
        disabled={isSubmitting}
      />
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

function normalizeSignupError(msg: string) {
  if (/409/.test(msg) || /already exists/i.test(msg))
    return "Email already in use.";
  if (/Network/i.test(msg)) return "Network error. Check your connection.";
  return msg;
}
