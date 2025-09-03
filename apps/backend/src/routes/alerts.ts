import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client";

const SaveSchema = z.object({
  above: z.number().finite().optional(),
  below: z.number().finite().optional(),
  enabled: z.boolean().optional(),
});

export const alertsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/alerts", { preHandler: app.auth }, async (req) => {
    const userId = req.user!.sub;
    return prisma.alert.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  });

  app.put(
    "/api/alerts/:coinId",
    { preHandler: app.auth },
    async (req, reply) => {
      const userId = req.user!.sub;
      const { coinId } = z
        .object({ coinId: z.string().min(1) })
        .parse(req.params);
      const body = SaveSchema.parse(req.body);

      if (body.above == null && body.below == null) {
        return reply.code(400).send({ error: "empty_rule" });
      }

      const saved = await prisma.alert.upsert({
        where: { userId_coinId: { userId, coinId } },
        update: { ...body },
        create: { userId, coinId, ...body },
      });
      return saved;
    },
  );

  app.delete(
    "/api/alerts/:coinId",
    { preHandler: app.auth },
    async (req, reply) => {
      const userId = req.user!.sub;
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
