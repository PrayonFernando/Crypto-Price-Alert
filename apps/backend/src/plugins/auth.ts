import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import jwt from "jsonwebtoken";

declare module "fastify" {
  interface FastifyInstance {
    auth: (req: any, reply: any) => Promise<void>;
  }
  interface FastifyRequest {
    user?: { sub: string };
  }
}

export const authPlugin: FastifyPluginAsync = fp(async (app) => {
  const DEV_BYPASS = process.env.DEV_BYPASS_AUTH === "1";
  const secret = process.env.JWT_SECRET;
  if (!secret && !DEV_BYPASS) {
    app.log.warn("JWT_SECRET missing and DEV_BYPASS_AUTH is not enabled");
  }

  app.decorate("auth", async (req, reply) => {
    if (DEV_BYPASS) {
      // Always set a user during dev bypass
      req.user = { sub: "dev-user" };
      return;
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "no_token" });
    }
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, secret!) as { sub?: string };
      if (!payload?.sub) throw new Error("no sub");
      req.user = { sub: payload.sub };
    } catch {
      return reply.code(401).send({ error: "bad_token" });
    }
  });
});

export default authPlugin;
