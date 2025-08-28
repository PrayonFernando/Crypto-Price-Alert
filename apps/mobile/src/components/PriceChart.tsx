import React from "react";
import { View, ActivityIndicator } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
} from "victory-native";

type Props = { data: Array<[number, number]>; loading?: boolean };
export default function PriceChart({ data, loading }: Props) {
  if (loading || !data?.length) {
    return (
      <View style={{ height: 220, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  const series = data.map(([t, p]) => ({ x: new Date(t), y: p }));
  return (
    <View style={{ height: 220 }}>
      <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
        <VictoryAxis tickFormat={(d) => `${new Date(d).getHours()}:00`} />
        <VictoryAxis dependentAxis tickFormat={(y) => `$${y.toFixed(0)}`} />
        <VictoryLine data={series} interpolation="monotoneX" />
      </VictoryChart>
    </View>
  );
}
