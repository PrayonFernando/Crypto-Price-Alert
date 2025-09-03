import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

/**
 * Adds app.auth preHandler. In dev, if DEV_BYPASS_AUTH=1 it injects a fake user.
 */
export const authPlugin: FastifyPluginAsync = fp(async (app) => {
  app.decorate("auth", async (req: FastifyRequest, reply: FastifyReply) => {
    if (process.env.DEV_BYPASS_AUTH === "1") {
      req.user = { sub: "dev-user-1", email: "dev@local" };
      return;
    }

    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) {
      reply.code(401).send({ error: "unauthorized" });
      return;
    }
    const token = h.slice(7);
    try {
      const payload = jwt.verify(token, SECRET) as any;
      req.user = {
        sub: String(payload.sub),
        email: payload.email ? String(payload.email) : undefined,
      };
    } catch {
      reply.code(401).send({ error: "invalid_token" });
    }
  });
});

export default authPlugin;
