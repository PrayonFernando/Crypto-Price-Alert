import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client";

const SaveSchema = z.object({
  above: z.number().finite().optional(),
  below: z.number().finite().optional(),
  enabled: z.boolean().optional(),
});

export const alertsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/alerts", { preHandler: app.auth }, async (req, reply) => {
    const userId = req.user?.sub;
    if (!userId) return reply.code(401).send({ error: "unauthorized" });

    return prisma.alert.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  });

  app.put(
    "/api/alerts/:coinId",
    { preHandler: app.auth },
    async (req, reply) => {
      const userId = req.user?.sub;
      if (!userId) return reply.code(401).send({ error: "unauthorized" });

      const { coinId } = z
        .object({ coinId: z.string().min(1) })
        .parse(req.params);
      const body = SaveSchema.parse(req.body);

      if (body.above == null && body.below == null) {
        return reply.code(400).send({ error: "empty_rule" });
      }

      try {
        // SAFE UPSERT: avoids Prisma’s cryptic error if keys are undefined
        const existing = await prisma.alert.findUnique({
          where: { userId_coinId: { userId, coinId } },
        });

        const saved = existing
          ? await prisma.alert.update({
              where: { id: existing.id },
              data: body,
            })
          : await prisma.alert.create({ data: { userId, coinId, ...body } });

        return saved;
      } catch (err) {
        req.log.error({ err }, "failed to save alert");
        return reply.code(500).send({ error: "save_failed" });
      }
    },
  );

  app.delete(
    "/api/alerts/:coinId",
    { preHandler: app.auth },
    async (req, reply) => {
      const userId = req.user?.sub;
      if (!userId) return reply.code(401).send({ error: "unauthorized" });

      const { coinId } = z
        .object({ coinId: z.string().min(1) })
        .parse(req.params);

      await prisma.alert
        .delete({ where: { userId_coinId: { userId, coinId } } })
        .catch(() => {});

      reply.code(204).send();
    },
  );
};

export default alertsRoutes;
