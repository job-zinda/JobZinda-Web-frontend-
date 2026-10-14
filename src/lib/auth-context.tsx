"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setSessionExpiredHandler, tokenStore } from "./api/client";
import { authApi, userApi, type RegisterInput } from "./api/endpoints";
import type { AuthResult, Profile } from "./types";

const USER_KEY = "jz_user";

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Guests browse public content; actions call requireAuth(). */
  isGuest: boolean;
  /** "normal" accounts haven't bought a plan (Flutter shows the plan upsell). */
  isNormalAccount: boolean;
  isPromoter: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthResult & { referralReward?: number; reward?: number }>;
  startSession: (result: AuthResult) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  /** Returns true when logged in; otherwise opens the login-required prompt. */
  requireAuth: (reason?: string) => boolean;
  loginPrompt: string | null;
  closeLoginPrompt: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readUser(): Profile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

function writeUser(user: Profile | null) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginPrompt, setLoginPrompt] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    tokenStore.clear();
    writeUser(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    if (!tokenStore.access) return null;
    try {
      const profile = await userApi.me();
      if (profile) {
        writeUser(profile);
        setUser(profile);
      }
      return profile;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Hydrate from storage on mount; localStorage is only reachable client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tokenStore.access) setUser(readUser());
    setIsLoading(false);
    void refreshProfile();
    setSessionExpiredHandler(() => {
      writeUser(null);
      setUser(null);
    });
    return () => setSessionExpiredHandler(null);
  }, [refreshProfile]);

  const startSession = useCallback(
    (result: AuthResult) => {
      tokenStore.set(result.tokens.access.token, result.tokens.refresh?.token ?? null);
      writeUser(result.user);
      setUser(result.user);
      queryClient.clear();
      void refreshProfile();
    },
    [queryClient, refreshProfile],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.loginUsername(username, password);
      if (!result?.tokens?.access?.token) throw new Error("Login failed — no token received");
      startSession(result);
    },
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authApi.register(input);
      if (!result?.tokens?.access?.token) throw new Error("Registration failed — no token received");
      startSession(result);
      return result;
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const refresh = tokenStore.refresh;
    if (refresh) await authApi.logout(refresh).catch(() => undefined);
    clearSession();
    router.push("/");
  }, [clearSession, router]);

  const isAuthenticated = !!user;

  const requireAuth = useCallback(
    (reason?: string) => {
      if (isAuthenticated) return true;
      setLoginPrompt(reason || "Log in or create an account to continue.");
      return false;
    },
    [isAuthenticated],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      isGuest: !isAuthenticated,
      isNormalAccount: !!user && (user.accountType ?? "normal").toLowerCase() === "normal",
      isPromoter: (user?.profession ?? "").toLowerCase() === "zinda promoter",
      login,
      register,
      startSession,
      logout,
      refreshProfile,
      requireAuth,
      loginPrompt,
      closeLoginPrompt: () => setLoginPrompt(null),
    }),
    [user, isLoading, isAuthenticated, login, register, startSession, logout, refreshProfile, requireAuth, loginPrompt],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
