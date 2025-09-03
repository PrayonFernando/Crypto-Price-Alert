import { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";
import { api } from "../lib/api";
import { saveToken, clearToken, getToken } from "../lib/session";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  trialStart: z.string(),
  trialEnd: z.string(),
  subscriptionStatus: z.string(),
});
type User = z.infer<typeof UserSchema>;

const AuthResponse = z.object({
  token: z.string(),
  user: UserSchema,
});

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    setLoading(true);
    try {
      const me = await api.get("/api/auth/me", UserSchema);
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) await refreshMe();
      else setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await api.post(
      "/api/auth/login",
      { email, password },
      AuthResponse,
    );
    await saveToken(token);
    setUser(user);
  }

  async function signup(email: string, password: string) {
    const { token, user } = await api.post(
      "/api/auth/signup",
      { email, password },
      AuthResponse,
    );
    await saveToken(token);
    setUser(user);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
