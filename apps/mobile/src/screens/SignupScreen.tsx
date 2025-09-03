import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16, gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>
        Create account
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          color: "#fff",
          borderColor: "#222",
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
        }}
      />
      <TextInput
        placeholder="Password (min 8)"
        placeholderTextColor="#666"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
        style={{
          color: "#fff",
          borderColor: "#222",
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
        }}
      />

      <Button
        title="Start free 3-day trial"
        onPress={async () => {
          try {
            await signup(email.trim(), pw);
          } catch (e: any) {
            Alert.alert("Signup failed", e.message ?? String(e));
          }
        }}
      />
    </View>
  );
}
