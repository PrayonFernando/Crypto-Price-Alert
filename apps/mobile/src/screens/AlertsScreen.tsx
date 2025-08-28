import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";

export default function AlertsScreen() {
  const [above, setAbove] = useState<string>("");
  const [below, setBelow] = useState<string>("");

  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {});
    Notifications.setNotificationChannelAsync("price-alerts", {
      name: "Price Alerts",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
    }).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#0B0B0B" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        Test local alert
      </Text>
      <Text style={{ color: "#aaa", marginBottom: 12 }}>
        This simulates an alert with a local notification (Expo Go supports
        this). Real push comes later with a dev build.
      </Text>

      <Text style={{ color: "#fff", marginBottom: 6 }}>
        Trigger if price goes ABOVE
      </Text>
      <TextInput
        value={above}
        onChangeText={setAbove}
        keyboardType="numeric"
        placeholder="e.g. 65000"
        placeholderTextColor="#555"
        style={{
          color: "#fff",
          borderColor: "#222",
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />

      <Text style={{ color: "#fff", marginBottom: 6 }}>
        Trigger if price goes BELOW
      </Text>
      <TextInput
        value={below}
        onChangeText={setBelow}
        keyboardType="numeric"
        placeholder="e.g. 58000"
        placeholderTextColor="#555"
        style={{
          color: "#fff",
          borderColor: "#222",
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />

      <Button
        title="Send test notification (5s)"
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Price Alert",
              body: `Test alert. Above=${above || "-"} / Below=${below || "-"}`,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 5,
              // repeats: false, // optional
            },
          });
          Alert.alert("Scheduled", "Local notification in ~5 seconds.");
        }}
      />
    </View>
  );
}
