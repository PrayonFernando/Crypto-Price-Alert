import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16, gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>
        Welcome
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
        placeholder="Password"
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
        title="Log in"
        onPress={async () => {
          try {
            await login(email.trim(), pw);
          } catch (e: any) {
            Alert.alert("Login failed", e.message ?? String(e));
          }
        }}
      />

      <TouchableOpacity onPress={() => nav.navigate("Signup")}>
        <Text style={{ color: "#9cf", marginTop: 16 }}>
          No account? Create one
        </Text>
      </TouchableOpacity>
    </View>
  );
}
