import { z } from "zod";
import { getToken } from "./session";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
console.log("EXPO_PUBLIC_API_URL =", BASE_URL);
if (!BASE_URL) throw new Error("Missing EXPO_PUBLIC_API_URL");

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init?.timeoutMs ?? 15000);

  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: ctrl.signal,
  });
  clearTimeout(t);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid response for ${path}: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const api = {
  get: <T>(path: string, schema: z.ZodType<T>) =>
    request(path, schema, { method: "GET" }),
  post: <T>(path: string, body: unknown, schema: z.ZodType<T>) =>
    request(path, schema, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown, schema: z.ZodType<T>) =>
    request(path, schema, { method: "PUT", body: JSON.stringify(body) }),
  del: (path: string) => request(path, z.any(), { method: "DELETE" }),
};
