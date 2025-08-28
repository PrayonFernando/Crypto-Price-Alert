import { View } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
} from "victory-native";
import type { ChartPoint } from "../services/coingecko";

export default function LineChart({ data }: { data: ChartPoint[] }) {
  return (
    <View style={{ height: 220 }}>
      <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
        <VictoryAxis tickFormat={() => ""} />
        <VictoryAxis dependentAxis tickFormat={(t) => String(t)} />
        <VictoryLine data={data} x="x" y="y" interpolation="monotoneX" />
      </VictoryChart>
    </View>
  );
}
