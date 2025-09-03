import { z } from "zod";
import { api } from "./api";

const UserDto = z.object({
  id: z.string(),
  email: z.string().email(),
  trialStart: z.string(),
  trialEnd: z.string(),
  subscriptionStatus: z.string(),
});

const AuthResponse = z.object({
  token: z.string(),
  user: UserDto,
});

export type AuthUser = z.infer<typeof UserDto>;

export const authApi = {
  async login(email: string, password: string) {
    return api.post("/auth/login", { email, password }, AuthResponse);
  },
  async signup(email: string, password: string) {
    return api.post("/auth/signup", { email, password }, AuthResponse);
  },
  async me() {
    return api.get("/auth/me", UserDto);
  },
};
