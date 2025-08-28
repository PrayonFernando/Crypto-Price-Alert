import Fastify from "fastify";
import cors from "@fastify/cors";
import marketsRoutes from "./routes/markets.js";

const PORT = Number(process.env.PORT ?? 8080);

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true, ts: Date.now() }));

  await app.register(marketsRoutes);

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`api listening on http://localhost:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
