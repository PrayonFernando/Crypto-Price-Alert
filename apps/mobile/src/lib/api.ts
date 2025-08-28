import { ZodSchema } from "zod";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
console.log("EXPO_PUBLIC_API_URL =", BASE_URL);
if (!BASE_URL) {
  // This throws early in dev so we don't silently fetch undefined
  // eslint-disable-next-line no-throw-literal
  throw new Error("Missing EXPO_PUBLIC_API_URL");
}

async function get<T>(
  path: string,
  schema: ZodSchema<T>,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      ...init,
      method: "GET",
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GET ${path} ${res.status}: ${body}`);
    }
    const json = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Schema mismatch for ${path}: ${parsed.error.message}`);
    }
    return parsed.data;
  } finally {
    clearTimeout(id);
  }
}

export const api = { get };
