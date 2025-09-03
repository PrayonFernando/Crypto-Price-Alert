const API = "https://api.coingecko.com/api/v3";
const BACKEND = process.env.EXPO_PUBLIC_API_URL;
const USE_BACKEND = !!BACKEND;

export type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h?: number;
};

export type ChartPoint = { x: Date; y: number };

function mapPricesToPoints(prices: [number, number][]): ChartPoint[] {
  return prices
    .filter(([ts, p]) => Number.isFinite(ts) && Number.isFinite(p))
    .map(([ts, p]) => ({ x: new Date(ts), y: p }));
}

async function directChart(
  coinId: string,
  days: number,
  vs: string,
): Promise<ChartPoint[]> {
  const interval = days <= 1 ? "minute" : "hourly";
  const url =
    `${API}/coins/${encodeURIComponent(coinId)}/market_chart` +
    `?vs_currency=${vs}&days=${days}&interval=${interval}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Chart HTTP ${res.status}`);
  const data = await res.json();
  return mapPricesToPoints(data?.prices ?? []);
}

export async function getTopMarkets(
  page = 1,
  perPage = 50,
  vs = "usd",
): Promise<Market[]> {
  if (USE_BACKEND) {
    const res = await fetch(
      `${BACKEND}/api/markets?vs=${vs}&page=${page}&perPage=${perPage}`,
    );
    if (!res.ok) throw new Error(`Backend markets HTTP ${res.status}`);
    return res.json();
  }

  const url =
    `${API}/coins/markets?vs_currency=${vs}` +
    `&order=market_cap_desc&per_page=${perPage}&page=${page}` +
    `&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Markets HTTP ${res.status}`);
  return res.json();
}

export async function getMarketChart(
  coinId: string,
  days = 1,
  vs = "usd",
): Promise<ChartPoint[]> {
  // 1) Try backend (if configured)
  if (USE_BACKEND) {
    try {
      const res = await fetch(
        `${BACKEND}/api/coins/${encodeURIComponent(coinId)}/chart?vs=${vs}&days=${days}`,
      );
      if (res.ok) {
        const data = await res.json();
        const pts = mapPricesToPoints(
          (data?.prices ?? []) as [number, number][],
        );
        if (pts.length) return pts;
      }
    } catch {}
  }

  // 2) Fallback to direct CoinGecko
  try {
    const pts = await directChart(coinId, days, vs);
    if (pts.length) return pts;
  } catch {}

  // 3) Final fallback: expand range (7d) to populate something
  return directChart(coinId, Math.max(days, 7), vs);
}

export async function getCoin(coinId: string): Promise<{
  id: string;
  symbol: string;
  name: string;
  image: { small: string };
  market_data: {
    current_price: Record<string, number>;
    price_change_percentage_24h?: number;
  };
}> {
  if (USE_BACKEND) {
    const res = await fetch(
      `${BACKEND}/api/coins/${encodeURIComponent(coinId)}`,
    );
    if (!res.ok) throw new Error(`Backend coin HTTP ${res.status}`);
    return res.json();
  }

  const url =
    `${API}/coins/${encodeURIComponent(coinId)}` +
    `?localization=false&tickers=false&market_data=true` +
    `&community_data=false&developer_data=false&sparkline=false`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Coin HTTP ${res.status}`);
  return res.json();
}
