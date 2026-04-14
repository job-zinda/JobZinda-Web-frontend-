"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  role?: string;
  profession?: string;
  mobileNumber?: string;
  profileImageUrl?: string;
  gender?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001/api/v1";

// Helper: recursively search an object for a token-like field
function findToken(obj: Record<string, unknown>): string {
  const TOKEN_KEYS = ["token", "accessToken", "access_token", "jwt", "authToken", "auth_token"];
  for (const key of TOKEN_KEYS) {
    if (typeof obj[key] === "string" && (obj[key] as string).length > 10) {
      return obj[key] as string;
    }
  }
  // Search one level deeper
  for (const val of Object.values(obj)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const found = findToken(val as Record<string, unknown>);
      if (found) return found;
    }
  }
  return "";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("jz_token");
      const storedUser = localStorage.getItem("jz_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // API shape: { status, statusCode, message, data: { user, tokens: { access, refresh } } }
      const apiData = data.data || data;
      const rawUser = apiData.user || apiData;
      const tokens = apiData.tokens;

      // Normalize user object
      const userData: User = {
        id: rawUser._id || rawUser.id || "",
        username: rawUser.username || rawUser.name || username,
        name: rawUser.name || "",
        email: rawUser.email || "",
        firstName: rawUser.firstName || rawUser.name?.split(" ")[0] || "",
        lastName: rawUser.lastName || rawUser.name?.split(" ").slice(1).join(" ") || "",
        bio: rawUser.bio || "",
        role: rawUser.role || rawUser.profession || "",
        profession: rawUser.profession || "",
        mobileNumber: rawUser.mobileNumber || "",
        profileImageUrl: rawUser.profileImageUrl || "",
        gender: rawUser.gender || "",
      };

      // Extract access token: data.tokens.access.token
      const accessToken = tokens?.access?.token || findToken(data) || "";

      if (!accessToken) {
        throw new Error("Login failed — no token received from server");
      }

      // Store refresh token if available
      if (tokens?.refresh?.token) {
        localStorage.setItem("jz_refresh_token", tokens.refresh.token);
      }

      localStorage.setItem("jz_token", accessToken);
      localStorage.setItem("jz_user", JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);

      router.push("/profile");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("jz_token");
    localStorage.removeItem("jz_refresh_token");
    localStorage.removeItem("jz_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
