import React from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { z } from "zod";
import { api } from "../lib/api";
import colors from "../theme/colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const AlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  coinId: z.string(),
  above: z.number().nullable().optional(),
  below: z.number().nullable().optional(),
  enabled: z.boolean(),
  updatedAt: z.string(),
});
const AlertsSchema = z.array(AlertSchema);
type A = z.infer<typeof AlertSchema>;

export default function AlertsListScreen() {
  const nav = useNavigation<any>();
  const [rows, setRows] = React.useState<A[]>([]);
  const [loading, setLoading] = React.useState(false);
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/alerts", AlertsSchema);
      setRows(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  async function remove(id: string, coinId: string) {
    Alert.alert("Remove alert", `Delete alert for ${coinId}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.del(`/api/alerts/${coinId}`);
          load();
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={rows}
        keyExtractor={(a) => a.id}
        onRefresh={load}
        refreshing={loading}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() =>
              nav.navigate("Alerts", {
                coinId: item.coinId,
                coinName: item.coinId,
              })
            }
            onLongPress={() => remove(item.id, item.coinId)}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {item.coinId}
            </Text>
            <Text style={{ color: "#bbb", marginTop: 4 }}>
              Above: {item.above ?? "-"} · Below: {item.below ?? "-"} ·{" "}
              {item.enabled ? "On" : "Off"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#aaa" }}>No alerts yet.</Text>
          </View>
        }
      />
    </View>
  );
}
