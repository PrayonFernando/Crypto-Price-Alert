import { Image, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import type { Market } from "../services/coingecko";
import colors from "../theme/colors";
import { fmtMoney, fmtPct } from "../utils/number";

type Props = { item: Market; onPress: () => void };
export default function CoinRow({ item, onPress }: Props) {
  const pct = item.price_change_percentage_24h ?? 0;
  const pctColor = pct >= 0 ? colors.success : colors.danger;
  return (
    <TouchableOpacity onPress={onPress} style={s.row}>
      <View style={s.left}>
        <Image source={{ uri: item.image }} style={s.icon} />
        <View>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.symbol}>{item.symbol.toUpperCase()}</Text>
        </View>
      </View>
      <View style={s.right}>
        <Text style={s.price}>{fmtMoney(item.current_price)}</Text>
        <Text style={[s.pct, { color: pctColor }]}>{fmtPct(pct)}</Text>
      </View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: "row", gap: 10, alignItems: "center" },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  symbol: { color: colors.textMuted, fontSize: 12 },
  right: { alignItems: "flex-end" },
  price: { color: colors.text, fontWeight: "700" },
  pct: { marginTop: 4, fontWeight: "600" },
});
