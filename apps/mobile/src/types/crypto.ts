import { z } from "zod";

export const MarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url().optional(),
  current_price: z.number(),
  price_change_percentage_24h: z.number().nullable().optional(),
});

export type Market = z.infer<typeof MarketSchema>;

export const MarketsResponseSchema = z.array(MarketSchema);

export const CoinDetailSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.object({ large: z.string().optional() }).optional(),
  market_data: z
    .object({
      current_price: z.object({ usd: z.number().optional() }).optional(),
      price_change_percentage_24h: z.number().nullable().optional(),
    })
    .optional(),
});

export type CoinDetail = z.infer<typeof CoinDetailSchema>;

export const ChartResponseSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])), // [timestamp, price]
});
export type ChartResponse = z.infer<typeof ChartResponseSchema>;
