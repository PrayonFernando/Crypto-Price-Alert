import Redis from "ioredis";

const REDIS_ENABLED = process.env.SKIP_REDIS !== "1";
let redis: Redis | null = null;

if (REDIS_ENABLED) {
  try {
    redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
      lazyConnect: false,
      maxRetriesPerRequest: null,
      enableAutoPipelining: true,
    });
    redis.on("error", (e) => console.warn("[redis] error:", e.message));
  } catch {
    // ignore, we'll behave as disabled
    redis = null;
  }
}

function timeout<T>(p: Promise<T>, ms = 120): Promise<T | null> {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => {
      if (!done) resolve(null);
    }, ms);
    p.then((v) => {
      if (!done) {
        done = true;
        clearTimeout(t);
        resolve(v);
      }
    }).catch(() => {
      if (!done) {
        done = true;
        clearTimeout(t);
        resolve(null);
      }
    });
  });
}

export async function redisGetJSON<T>(key: string): Promise<T | null> {
  if (!REDIS_ENABLED || !redis) return null;
  const v = await timeout(redis.get(key));
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function redisSetJSON(key: string, val: unknown, ttlSec: number) {
  if (!REDIS_ENABLED || !redis) return;
  try {
    await redis.set(key, JSON.stringify(val), "EX", ttlSec);
  } catch {}
}
