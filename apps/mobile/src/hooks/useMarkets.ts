import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../lib/api";
import { getTopMarkets } from "../services/coingecko";

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

export function useMarkets(vs = "usd", page = 1, perPage = 50) {
  return useQuery({
    queryKey: ["markets", vs, page, perPage],
    queryFn: () => getTopMarkets(page, perPage, vs),
    refetchInterval: 2000, // refresh list every 2s
    staleTime: 1000, // cache a bit to avoid flicker
  });
}
