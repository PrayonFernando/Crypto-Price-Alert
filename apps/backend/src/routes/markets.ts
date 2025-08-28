import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TTLCache } from "../lib/cache.js";

const marketsCache = new TTLCache<string, any>(10_000); // 10s
const chartCache = new TTLCache<string, any>(60_000); // 60s

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
    const cached = marketsCache.get(key);
    if (cached) return cached;

    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${q.vs}` +
      `&order=market_cap_desc&per_page=${q.perPage}&page=${q.page}` +
      `&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok)
      return reply
        .code(502)
        .send({ error: "coingecko_error", status: res.status });

    const data = await res.json();
    marketsCache.set(key, data);
    return data;
  });

  app.get("/api/coins/:id", async (req, reply) => {
    const p = z.object({ id: z.string().min(1) }).parse(req.params);
    const key = `coin:${p.id}`;
    const cached = marketsCache.get(key);
    if (cached) return cached;

    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(p.id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok)
      return reply
        .code(502)
        .send({ error: "coingecko_error", status: res.status });

    const data = await res.json();
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

    const key = `chart:${p.id}:${q.vs}:${q.days}`;
    const cached = chartCache.get(key);
    if (cached) return cached;

    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(p.id)}/market_chart?vs_currency=${q.vs}&days=${q.days}&interval=hourly`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok)
      return reply
        .code(502)
        .send({ error: "coingecko_error", status: res.status });

    const data = await res.json();
    chartCache.set(key, data);
    return data;
  });
}
