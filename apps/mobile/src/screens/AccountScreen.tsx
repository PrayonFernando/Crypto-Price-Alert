import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={s.container}>
      {user ? (
        <>
          <Text style={s.label}>Email</Text>
          <Text style={s.value}>{user.email}</Text>
          <View style={{ height: 16 }} />
          <Button title="Log out" onPress={logout} />
        </>
      ) : (
        <Text style={{ color: "#ccc" }}>You are not logged in.</Text>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  label: { color: "#999", marginBottom: 4 },
  value: { color: colors.text, fontWeight: "700" },
});
