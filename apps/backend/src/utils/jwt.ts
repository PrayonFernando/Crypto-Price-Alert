import jwt from "jsonwebtoken";
import { env } from "../env";

export function signJwt(sub: string) {
  return jwt.sign({ sub }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as {
    sub: string;
    iat: number;
    exp: number;
  };
}
