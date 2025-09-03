import Redis from "ioredis";

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
export const redis = new Redis(url, {
  lazyConnect: false,
  maxRetriesPerRequest: null, // ok for API reads
});
