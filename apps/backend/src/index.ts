import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import marketsRoutes from "./routes/markets";
import { authRoutes } from "./routes/auth";
import { authPlugin } from "./plugins/auth";
import { alertsRoutes } from "./routes/alerts";
import { devicesRoutes } from "./routes/devices";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

// public
await app.register(marketsRoutes);
await app.register(authRoutes);

// protected
await app.register(authPlugin);
await app.register(alertsRoutes);
await app.register(devicesRoutes);

app.get("/health", async () => ({ ok: true, ts: Date.now() }));
await app.listen({ host: "0.0.0.0", port: 8080 });
