import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { TTLCache } from "../lib/cache.js";
import { redis } from "../lib/redis.js";
import { redisGetJSON, redisSetJSON } from "../lib/redisSafe.js";

const marketsCache = new TTLCache<string, any>(10_000); // 10s
const chartCache = new TTLCache<string, any>(60_000); // 60s
const CG_KEY = process.env.COINGECKO_API_KEY;

async function fetchCoingeckoWithRetry(
  url: string,
  reply: FastifyReply,
  opts?: { retries?: number; stale?: any },
) {
  const retries = opts?.retries ?? 2;
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          ...(CG_KEY ? { "x-cg-demo-api-key": CG_KEY } : {}),
        },
      });
      if (res.ok) return await res.json();

      if ([429, 500, 502, 503, 504].includes(res.status)) {
        lastErr = new Error(`Upstream ${res.status}`);
      } else {
        return reply
          .code(502)
          .send({ error: "coingecko_error", status: res.status });
      }
    } catch (e) {
      lastErr = e;
    }
    const delay = 250 + attempt * 350 + Math.floor(Math.random() * 120);
    await new Promise((r) => setTimeout(r, delay));
  }

  if (opts?.stale) {
    reply.header("X-From-Cache", "stale");
    return opts.stale;
  }
  return reply
    .code(502)
    .send({ error: "coingecko_error", detail: String(lastErr ?? "unknown") });
}

export default async function routes(app: FastifyInstance) {
  app.get("/api/markets", async (req, reply) => {
    const q = z
      .object({
        vs: z.string().default("usd"),
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(250).default(50),
      })
      .parse(req.query);

    const key = `markets:${q.vs}:${q.page}:${q.perPage}`;

    const fromRedis = await redisGetJSON<any[]>(key);
    if (fromRedis) {
      reply.header("X-Source", "redis");
      return fromRedis;
    }

    // 2) Try in-process TTL cache
    const mem = marketsCache.get(key);
    if (mem) {
      reply.header("X-Source", "memory");
      return mem;
    }

    // 3) Fallback to upstream (once), then populate caches
    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${q.vs}` +
      `&order=market_cap_desc&per_page=${q.perPage}&page=${q.page}` +
      `&sparkline=false&price_change_percentage=24h`;

    const data = await fetchCoingeckoWithRetry(url, reply, { retries: 2 });
    if (reply.sent) return;

    marketsCache.set(key, data);
    await redisSetJSON(key, data, 20);
    reply.header("X-Source", "upstream");
    return data;
  });

  app.get("/api/coins/:id", async (req, reply) => {
    const p = z.object({ id: z.string().min(1) }).parse(req.params);
    const key = `coin:${p.id}`;

    // prefer memory (for detail) just like before
    const cached = marketsCache.get(key);
    if (cached) return cached;

    const url =
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(p.id)}` +
      `?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;

    const data = await fetchCoingeckoWithRetry(url, reply, {
      retries: 2,
      stale: cached,
    });
    if (reply.sent) return;
    marketsCache.set(key, data);
    return data;
  });

  app.get("/api/coins/:id/chart", async (req, reply) => {
    const p = z.object({ id: z.string().min(1) }).parse(req.params);
    const q = z
      .object({
        vs: z.string().default("usd"),
        days: z.coerce.number().min(1).max(3650).default(1),
      })
      .parse(req.query);

    const interval = q.days <= 1 ? "minute" : "hourly"; // 👈 change
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
      p.id,
    )}/market_chart?vs_currency=${q.vs}&days=${q.days}&interval=${interval}`;

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok)
      return reply
        .code(502)
        .send({ error: "coingecko_error", status: res.status });

    const data = await res.json(); // { prices: [[t, p], ...], ... }
    chartCache.set(`chart:${p.id}:${q.vs}:${q.days}`, data);
    return data;
  });
}
