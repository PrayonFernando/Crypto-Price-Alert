import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import * as Notifications from "expo-notifications";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { getAlert, saveAlert } from "../storage/alerts";
import { api } from "../lib/api";
import { z } from "zod";

const SavedSchema = z.object({
  id: z.string(),
  coinId: z.string(),
  above: z.number().nullable().optional(),
  below: z.number().nullable().optional(),
  enabled: z.boolean(),
});

type AlertsRoute = RouteProp<RootStackParamList, "Alerts">;

export default function AlertsScreen() {
  const route = useRoute<AlertsRoute>();
  const nav = useNavigation();
  const { coinId, coinName } = route.params ?? {
    coinId: "unknown",
    coinName: "Unknown",
  };

  const [aboveText, setAboveText] = useState<string>("");
  const [belowText, setBelowText] = useState<string>("");

  const inputAccessoryViewID = useMemo(() => "doneAccessory", []);

  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {});
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("price-alerts", {
        name: "Price Alerts",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      }).catch(() => {});
    }
  }, []);

  // Load existing rule (if any)
  useEffect(() => {
    (async () => {
      const existing = await getAlert(coinId);
      if (existing?.above != null) setAboveText(String(existing.above));
      if (existing?.below != null) setBelowText(String(existing.below));
    })();
  }, [coinId]);

  const save = async () => {
    const above = aboveText.trim() ? Number(aboveText) : undefined;
    const below = belowText.trim() ? Number(belowText) : undefined;

    if (Number.isNaN(above as any) || Number.isNaN(below as any)) {
      Alert.alert("Invalid input", "Please enter valid numbers.");
      return;
    }
    if ([above, below].every((v) => v == null)) {
      Alert.alert("Nothing to save", "Enter at least one threshold.");
      return;
    }
    await saveAlert(coinId, {
      above,
      below,
      enabled: true,
      updatedAt: Date.now(),
      coinName,
    });

    await api.put(
      `/api/alerts/${coinId}`,
      { above, below, enabled: true },
      SavedSchema,
    );

    // Give quick local feedback (works in Expo Go)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alert saved",
        body: `${coinName}: Above=${above ?? "-"} / Below=${below ?? "-"}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });

    Alert.alert("Saved", "Your alert thresholds are saved.", [
      { text: "OK", onPress: () => nav.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0B0B0B" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
            Set Alert — {coinName}
          </Text>

          <Text style={{ color: "#fff", marginBottom: 6 }}>
            Trigger if price goes ABOVE
          </Text>
          <TextInput
            value={aboveText}
            onChangeText={setAboveText}
            keyboardType="numeric"
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            placeholder="e.g. 65000"
            placeholderTextColor="#555"
            style={{
              color: "#fff",
              borderColor: "#222",
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <Text style={{ color: "#fff", marginBottom: 6 }}>
            Trigger if price goes BELOW
          </Text>
          <TextInput
            value={belowText}
            onChangeText={setBelowText}
            keyboardType="numeric"
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            placeholder="e.g. 58000"
            placeholderTextColor="#555"
            style={{
              color: "#fff",
              borderColor: "#222",
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
          />

          <Button title="Save alert" onPress={save} />

          <View style={{ height: 40 }} />
        </ScrollView>
      </TouchableWithoutFeedback>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View
            style={{
              backgroundColor: "#111",
              padding: 8,
              alignItems: "flex-end",
            }}
          >
            <Button title="Done" onPress={() => Keyboard.dismiss()} />
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
}
