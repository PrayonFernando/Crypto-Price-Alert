import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  getCoin,
  getMarketChart,
  type ChartPoint,
} from "../services/coingecko";
import colors from "../theme/colors";
import { fmtMoney, fmtPct } from "../utils/number";
import LineChart from "../components/LineChart";

export default function CoinDetailScreen() {
  const { params } = useRoute() as any;
  const nav = useNavigation<any>();
  const coinId: string = params?.coinId;

  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState<number | undefined>();
  const [pct, setPct] = useState<number | undefined>();
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [icon, setIcon] = useState<string | undefined>();
  const [chart, setChart] = useState<ChartPoint[]>([]);

  useEffect(() => {
    let alive = true;

    async function fetchAll() {
      setLoading(true);
      try {
        const [c, ch] = await Promise.all([
          getCoin(coinId),
          getMarketChart(coinId, 1, "usd"),
        ]);
        if (!alive) return;
        setName(c.name);
        setSymbol(c.symbol?.toUpperCase?.() ?? "");
        setIcon(c.image?.small);
        setPrice(c.market_data?.current_price?.usd);
        setPct(c.market_data?.price_change_percentage_24h);
        setChart(ch);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchAll();

    // light polling fallbacks
    const priceTimer = setInterval(async () => {
      try {
        const c = await getCoin(coinId);
        if (!alive) return;
        setPrice(c.market_data?.current_price?.usd);
        setPct(c.market_data?.price_change_percentage_24h);
      } catch {}
    }, 20000); // 20s as a backup

    const chartTimer = setInterval(async () => {
      try {
        const ch = await getMarketChart(coinId, 1, "usd");
        if (!alive) return;
        setChart(ch);
      } catch {}
    }, 60000); // 60s refresh

    return () => {
      alive = false;
      clearInterval(priceTimer);
      clearInterval(chartTimer);
    };
  }, [coinId]);

  // Live price (Binance miniTicker) — client-side WS
  useEffect(() => {
    if (!symbol) return;
    const pair = `${symbol}USDT`.toLowerCase(); // e.g., BTC → btcusdt
    const url = `wss://stream.binance.com:9443/ws/${pair}@miniTicker`;
    let ws: WebSocket | null = null;
    let closed = false;

    try {
      ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(String(e.data));
          // 'c' = last price (string)
          if (msg?.c) setPrice(parseFloat(msg.c));
        } catch {}
      };
      ws.onerror = () => {
        // ignore; fallback polling keeps price moving
      };
    } catch {
      // ignore
    }

    return () => {
      closed = true;
      try {
        ws?.close();
      } catch {}
    };
  }, [symbol]);

  return (
    <View style={s.container}>
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <View style={s.headerRow}>
            {icon ? <Image source={{ uri: icon }} style={s.icon} /> : null}
            <Text style={s.title}>{name}</Text>
          </View>

          <View style={s.card}>
            <Text style={s.price}>{fmtMoney(price)}</Text>
            <Text
              style={[
                s.pct,
                { color: (pct ?? 0) >= 0 ? colors.success : colors.danger },
              ]}
            >
              {fmtPct(pct)}
            </Text>
          </View>

          <LineChart data={chart} />

          <TouchableOpacity
            style={s.cta}
            onPress={() => nav.navigate("Alerts", { coinId, coinName: name })}
          >
            <Text style={s.ctaText}>Set Alert (Above / Below)</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  price: { color: colors.text, fontSize: 20, fontWeight: "800" },
  pct: { marginTop: 6, fontWeight: "700" },
  cta: {
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaText: { color: "#000", fontWeight: "700" },
});
