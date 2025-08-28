import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { MarketsResponseSchema } from "../types/crypto";

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: () => api.get("/api/markets", MarketsResponseSchema),
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 0,
  });
}
