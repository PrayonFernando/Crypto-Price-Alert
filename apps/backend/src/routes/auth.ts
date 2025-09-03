import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import rateLimit from "@fastify/rate-limit";
import { prisma } from "../prisma/client";
import { signJwt } from "../utils/jwt";

const Email = z.string().email().min(5).max(120);
const Password = z
  .string()
  .min(8)
  .max(128)
  .refine((s) => {
    const lower = /[a-z]/.test(s);
    const upper = /[A-Z]/.test(s);
    const digit = /\d/.test(s);
    const sym = /[^A-Za-z0-9]/.test(s);
    return [lower, upper, digit, sym].filter(Boolean).length >= 3;
  }, "Weak password: include a mix of cases, numbers, symbols");

const SignupBody = z.object({ email: Email, password: Password });
const LoginBody = z.object({ email: Email, password: z.string().min(1) });

function in3Days(d = new Date()) {
  const t = new Date(d);
  t.setDate(t.getDate() + 3);
  return t;
}

export const authRoutes: FastifyPluginAsync = async (f) => {
  await f.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute",
    allowList: [],
    keyGenerator: (req: FastifyRequest) => req.ip ?? "unknown",
    nameSpace: "auth",
  });

  f.post(
    "/api/auth/signup",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = SignupBody.parse(req.body);
      const email = body.email.toLowerCase().trim();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing)
        return reply.code(409).send({ error: "Email already exists" });

      const passwordHash = await argon2.hash(body.password, {
        type: argon2.argon2id,
      });
      const trialStart = new Date();
      const trialEnd = in3Days(trialStart);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          trialStart,
          trialEnd,
          subscriptionStatus: "trial",
        },
      });

      const token = signJwt(user.id);
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          trialStart: user.trialStart.toISOString(),
          trialEnd: user.trialEnd.toISOString(),
          subscriptionStatus: user.subscriptionStatus,
        },
      };
    },
  );

  f.post(
    "/api/auth/login",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = LoginBody.parse(req.body);
      const email = body.email.toLowerCase().trim();

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return reply.code(401).send({ error: "Invalid credentials" });

      const ok = await argon2.verify(user.passwordHash, body.password);
      if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

      const token = signJwt(user.id);
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          trialStart: user.trialStart.toISOString(),
          trialEnd: user.trialEnd.toISOString(),
          subscriptionStatus: user.subscriptionStatus,
        },
      };
    },
  );

  // protected (after authPlugin is registered)
  f.get("/api/auth/me", async (req, reply) => {
    if (!req.user?.sub) return reply.code(401).send({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return reply.code(404).send({ error: "Not found" });
    return {
      id: user.id,
      email: user.email,
      trialStart: user.trialStart.toISOString(),
      trialEnd: user.trialEnd.toISOString(),
      subscriptionStatus: user.subscriptionStatus,
    };
  });
};
