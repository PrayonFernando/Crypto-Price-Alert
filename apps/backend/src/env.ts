import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16), // at least 16 chars
});

export const env = Env.parse(process.env);
