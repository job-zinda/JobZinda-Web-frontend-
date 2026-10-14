// Fetch wrapper for the JobZinda backend.
// Mirrors jobzindaflutterfinal/lib/utils/api_service.dart: Bearer auth, a single
// in-flight refresh on 401, then one retry of the original request.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://server2.jobzinda.com/api/v1";

const TOKEN_KEY = "jz_token";
const REFRESH_KEY = "jz_refresh_token";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function safeGet(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode etc.)
  }
}

export const tokenStore = {
  get access() {
    return safeGet(TOKEN_KEY);
  },
  get refresh() {
    return safeGet(REFRESH_KEY);
  },
  set(access: string | null, refresh?: string | null) {
    safeSet(TOKEN_KEY, access);
    if (refresh !== undefined) safeSet(REFRESH_KEY, refresh);
  },
  clear() {
    safeSet(TOKEN_KEY, null);
    safeSet(REFRESH_KEY, null);
  },
};

// Called when a refresh fails so the auth context can drop the session.
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: (() => void) | null) {
  onSessionExpired = fn;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip the Authorization header (public endpoints). */
  noAuth?: boolean;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(API_BASE.replace(/\/$/, "") + "/" + path.replace(/^\//, ""));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refresh = tokenStore.refresh;
  if (!refresh) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(buildUrl("auth/refresh-tokens"), {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-platform": "jobzinda" },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        const json = await res.json().catch(() => null);
        const tokens = json?.data?.tokens ?? json?.data;
        const access = tokens?.access?.token;
        if (!res.ok || !access) return false;
        tokenStore.set(access, tokens?.refresh?.token ?? refresh);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => (refreshPromise = null), 0);
      }
    })();
  }
  return refreshPromise;
}

function isUnauthorized(status: number, json: unknown) {
  if (status === 401) return true;
  const j = json as { statusCode?: number; code?: number } | null;
  return j?.statusCode === 401 || j?.code === 401;
}

async function send(path: string, opts: RequestOptions, isRetry = false): Promise<unknown> {
  const headers: Record<string, string> = { "x-platform": "jobzinda", ...opts.headers };
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (opts.body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const access = opts.noAuth ? null : tokenStore.access;
  if (access) headers.Authorization = `Bearer ${access}`;

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers,
    body:
      opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
  });
  const json = await res.json().catch(() => null);

  if (access && !isRetry && isUnauthorized(res.status, json)) {
    if (await refreshTokens()) return send(path, opts, true);
    tokenStore.clear();
    onSessionExpired?.();
    throw new ApiError("Session expired. Please log in again.", 401, json);
  }

  if (!res.ok || (json && json.status === false)) {
    const message =
      (json && (json.message || json.error)) || `Request failed (${res.status})`;
    throw new ApiError(String(message), json?.statusCode ?? res.status, json);
  }
  return json;
}

/** Calls the API and returns the `data` field of the standard `{status, message, data}` envelope. */
export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const json = (await send(path, opts)) as { data?: T } | T;
  if (json && typeof json === "object" && "data" in (json as object)) return (json as { data: T }).data;
  return json as T;
}

/** Returns the full envelope (for endpoints whose useful fields sit beside `data`). */
export async function apiRaw<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  return (await send(path, opts)) as T;
}

export type UploadFolder = "media" | "stories/images" | "stories/videos" | "audio" | "profile" | "evidence";

/** POST /upload/single — returns the public URL of the stored file. */
export async function uploadFile(file: Blob, folder: UploadFolder = "media", filename?: string) {
  const form = new FormData();
  form.append("folder", folder);
  form.append("file", file, filename ?? (file instanceof File ? file.name : "upload"));
  const data = await api<{ url: string; path?: string }>("upload/single", { method: "POST", body: form });
  return data.url;
}
