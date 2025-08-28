import React from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useMarkets } from "../hooks/useMarkets";
import { fmtUsd, fmtPct, pctColor } from "../utils/format";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ErrorBanner from "../components/ErrorBanner";

type RootStackParamList = {
  Home: undefined;
  CoinDetail: { id: string; name: string };
  Alerts: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { data, isLoading, refetch, isRefetching, error } = useMarkets();
  const errMsg =
    error instanceof Error ? error.message : error ? String(error) : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0B" }}>
      <ErrorBanner message={errMsg} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={refetch}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              borderBottomColor: "#1b1b1b",
              borderBottomWidth: 1,
            }}
            onPress={() =>
              navigation.navigate("CoinDetail", {
                id: item.id,
                name: item.name,
              })
            }
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={{
                  width: 28,
                  height: 28,
                  marginRight: 10,
                  borderRadius: 14,
                }}
              />
            ) : (
              <View
                style={{
                  width: 28,
                  height: 28,
                  marginRight: 10,
                  backgroundColor: "#222",
                  borderRadius: 14,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {item.name}{" "}
                <Text style={{ color: "#999", fontSize: 12 }}>
                  {item.symbol.toUpperCase()}
                </Text>
              </Text>
              <Text style={{ color: "#ccc", marginTop: 2 }}>
                {fmtUsd(item.current_price)}
              </Text>
            </View>
            <Text
              style={{
                color: pctColor(item.price_change_percentage_24h),
                fontWeight: "700",
              }}
            >
              {fmtPct(item.price_change_percentage_24h)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#aaa" }}>No data yet.</Text>
          </View>
        }
      />
    </View>
  );
}
