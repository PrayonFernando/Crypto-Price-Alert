import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";

export default function HomeScreen() {
  const { user } = useAuth();
  const trialDaysLeft = user
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.trialEnd).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <View style={s.container}>
      <Text style={s.title}>Crypto Price Alert</Text>
      <Text style={s.body}>
        Set ABOVE/BELOW thresholds for any coin and get notified instantly.
      </Text>
      {user ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>Your subscription</Text>
          <Text style={s.cardBody}>
            Status:{" "}
            <Text style={{ fontWeight: "700" }}>{user.subscriptionStatus}</Text>
          </Text>
          <Text style={s.cardBody}>
            Trial ends: {new Date(user.trialEnd).toDateString()} (
            {trialDaysLeft} days left)
          </Text>
        </View>
      ) : (
        <View style={s.card}>
          <Text style={s.cardTitle}>Free 3-day Trial</Text>
          <Text style={s.cardBody}>
            Create an account to start your trial. No payment now.
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  body: { color: "#bbb" },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: { color: colors.text, fontWeight: "800", marginBottom: 6 },
  cardBody: { color: "#ddd" },
});
