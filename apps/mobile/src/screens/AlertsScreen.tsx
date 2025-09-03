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
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { getAlert, saveAlert } from "../storage/alerts";
import { api } from "../lib/api";
import { z } from "zod";
import colors from "../theme/colors";

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
  const nav = useNavigation<any>();
  const { coinId, coinName } = route.params ?? {
    coinId: "unknown",
    coinName: "Unknown",
  };

  const [aboveText, setAboveText] = useState<string>("");
  const [belowText, setBelowText] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const inputAccessoryViewID = useMemo(() => "doneAccessory", []);
  const insets = useSafeAreaInsets();

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
    let alive = true;
    (async () => {
      try {
        const existing = await getAlert(coinId);
        if (!alive) return;
        if (existing?.above != null) setAboveText(String(existing.above));
        if (existing?.below != null) setBelowText(String(existing.below));
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [coinId]);

  const save = async () => {
    if (saving) return;
    try {
      const above = aboveText.trim() ? Number(aboveText) : undefined;
      const below = belowText.trim() ? Number(belowText) : undefined;

      if (
        (aboveText.trim() && Number.isNaN(above)) ||
        (belowText.trim() && Number.isNaN(below))
      ) {
        Alert.alert("Invalid input", "Please enter valid numbers.");
        return;
      }
      if (above == null && below == null) {
        Alert.alert("Nothing to save", "Enter at least one threshold.");
        return;
      }
      if ((above ?? -Infinity) <= 0 || (below ?? -Infinity) <= 0) {
        Alert.alert("Invalid price", "Thresholds must be positive numbers.");
        return;
      }

      setSaving(true);

      // persist locally (for quick UX + offline)
      await saveAlert(coinId, {
        above,
        below,
        enabled: true,
        updatedAt: Date.now(),
        coinName,
      });

      // persist on backend (authoritative)
      await api.put(
        `/api/alerts/${coinId}`,
        { above, below, enabled: true },
        SavedSchema,
      );

      // quick local feedback (works in Expo Go)
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
    } catch (e: any) {
      Alert.alert("Save failed", String(e?.message ?? e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={s.flex}>
            <ScrollView
              contentContainerStyle={[
                s.content,
                { paddingBottom: (insets.bottom || 12) + 96 },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={s.title}>Set Alert — {coinName}</Text>

              <Text style={s.label}>Trigger if price goes ABOVE</Text>
              <TextInput
                value={aboveText}
                onChangeText={setAboveText}
                keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? inputAccessoryViewID : undefined
                }
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                placeholder="e.g. 65000"
                placeholderTextColor="#555"
                style={s.input}
              />

              <Text style={s.label}>Trigger if price goes BELOW</Text>
              <TextInput
                value={belowText}
                onChangeText={setBelowText}
                keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? inputAccessoryViewID : undefined
                }
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                placeholder="e.g. 58000"
                placeholderTextColor="#555"
                style={s.input}
              />
            </ScrollView>

            {/* Sticky footer Save button, always tappable */}
            <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
              <Button
                title={saving ? "Saving..." : "Save alert"}
                onPress={save}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={s.accessory}>
              <Button title="Done" onPress={() => Keyboard.dismiss()} />
            </View>
          </InputAccessoryView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  label: { color: colors.text, marginBottom: 6 },
  input: {
    color: "#fff",
    borderColor: "#222",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#0F0F0F",
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: "transparent",
  },
  accessory: { backgroundColor: "#111", padding: 8, alignItems: "flex-end" },
});
