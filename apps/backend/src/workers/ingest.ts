import "dotenv/config";
import { redis } from "../lib/redis.js";

const CG_KEY = process.env.COINGECKO_API_KEY;
const BASE = "https://api.coingecko.com/api/v3";

async function fetchMarkets(vs = "usd", page = 1, perPage = 50) {
  const url =
    `${BASE}/coins/markets?vs_currency=${vs}` +
    `&order=market_cap_desc&per_page=${perPage}&page=${page}` +
    `&sparkline=false&price_change_percentage=24h`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(CG_KEY ? { "x-cg-demo-api-key": CG_KEY } : {}),
    },
  });
  if (!res.ok) throw new Error(`CG ${res.status}`);
  return (await res.json()) as any[];
}

async function tick() {
  try {
    const vs = "usd";
    const page = 1;
    const perPage = 50;
    const data = await fetchMarkets(vs, page, perPage);

    // 1) Store the full page
    const pageKey = `markets:${vs}:${page}:${perPage}`;
    await redis.set(pageKey, JSON.stringify(data), "EX", 20); // 20s TTL

    // 2) Store per-coin quick prices (for alerts later)
    const pipe = redis.pipeline();
    for (const d of data) {
      const priceKey = `price:${d.id}:${vs}`;
      pipe.set(priceKey, String(d.current_price), "EX", 60);
    }
    await pipe.exec();

    // Optional: log lightweight heartbeat
    console.log(`[ingest] wrote ${data.length} @ ${new Date().toISOString()}`);
  } catch (e) {
    console.warn("[ingest] failed:", (e as Error).message);
  }
}

// Run every 8 seconds (staggered enough to avoid CG spikes)
tick();
setInterval(tick, 8000);
