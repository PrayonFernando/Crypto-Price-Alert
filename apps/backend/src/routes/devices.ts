import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client";

const Body = z.object({
  expoPushToken: z.string().min(10),
  platform: z.enum(["ios", "android"]),
});

export const devicesRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/api/devices/register",
    { preHandler: app.auth },
    async (req, reply) => {
      const userId = req.user!.sub;
      const body = Body.parse(req.body);
      const device = await prisma.device.upsert({
        where: { expoPushToken: body.expoPushToken },
        update: { userId, platform: body.platform },
        create: {
          userId,
          expoPushToken: body.expoPushToken,
          platform: body.platform,
        },
      });

      return device;
    },
  );
};
export default devicesRoutes;
