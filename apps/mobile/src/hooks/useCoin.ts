import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ChartResponseSchema, CoinDetailSchema } from "../types/crypto";

export function useCoinDetail(id: string) {
  return useQuery({
    queryKey: ["coin", id],
    queryFn: () => api.get(`/api/coins/${id}`, CoinDetailSchema),
    staleTime: 30_000,
    retry: 0,
  });
}

export function useCoinChart(id: string, days = 1) {
  return useQuery({
    queryKey: ["coin-chart", id, days],
    queryFn: () =>
      api.get(`/api/coins/${id}/chart?days=${days}`, ChartResponseSchema),
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 0,
  });
}
