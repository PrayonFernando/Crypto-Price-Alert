import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../lib/api";

const MarketSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  image: z.string().nullable().optional(),
  current_price: z.number().nullable().optional(),
  price_change_percentage_24h: z.number().nullable().optional(),
});
const MarketsSchema = z.array(MarketSchema);

export type Market = z.infer<typeof MarketSchema>;

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: () => api.get("/api/markets", MarketsSchema), // ✅ ensure /api prefix here
    staleTime: 30_000,
  });
}
