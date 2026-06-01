"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User, getStoredUser, storeAuth, clearAuth } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post("/auth/login", { email, password });
      storeAuth(res.data.access_token, res.data.user);
      setUser(res.data.user);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (email: string, password: string, name: string, tenantName?: string) => {
      const res = await api.post("/auth/register", {
        email,
        password,
        name,
        tenantName,
      });
      storeAuth(res.data.access_token, res.data.user);
      setUser(res.data.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, login, register, logout };
}
