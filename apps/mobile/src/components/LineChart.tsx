import React from "react";
import { View, Text } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
} from "victory-native";
import type { ChartPoint } from "../services/coingecko";

export default function LineChart({ data }: { data: ChartPoint[] }) {
  if (!data || data.length < 2) {
    return (
      <View
        style={{
          height: 220,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#222",
          backgroundColor: "#111",
        }}
      >
        <Text style={{ color: "#888" }}>No chart data</Text>
      </View>
    );
  }

  const vData = data.map((d) => ({ x: new Date(d.x), y: d.y }));
  return (
    <VictoryChart
      theme={VictoryTheme.material}
      height={240}
      padding={{ top: 20, bottom: 40, left: 48, right: 20 }}
      domainPadding={{ y: 12 }}
      scale={{ x: "time" }}
    >
      <VictoryAxis
        style={{
          axis: { stroke: "#333" },
          tickLabels: { fill: "#aaa", fontSize: 10, angle: 0 },
          grid: { stroke: "#222", strokeDasharray: "4,4" },
        }}
      />
      <VictoryAxis
        dependentAxis
        style={{
          axis: { stroke: "#333" },
          tickLabels: { fill: "#aaa", fontSize: 10 },
          grid: { stroke: "#222", strokeDasharray: "4,4" },
        }}
      />
      <VictoryLine
        interpolation="monotoneX"
        data={vData}
        animate={{ duration: 300 }}
        style={{ data: { strokeWidth: 2 } }}
      />
    </VictoryChart>
  );
}
