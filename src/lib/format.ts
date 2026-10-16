import type { Post, PostAuthor, UserRef } from "./types";

export function timeAgo(date?: string) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (Number.isNaN(diff)) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(date?: string, withTime = false) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function initials(name?: string) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function compact(n?: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n ?? 0);
}

export function money(amount?: number, symbol = "₹") {
  return `${symbol}${(amount ?? 0).toLocaleString("en-IN")}`;
}

/** Post.user is populated in feeds but a bare id in "my posts". */
export function postAuthor(post: Post, fallback?: { _id?: string; name?: string; profileImageUrl?: string }): PostAuthor {
  if (post.user && typeof post.user === "object") return post.user;
  return {
    _id: (post.user as string) || fallback?._id || "",
    userName: fallback?.name,
    userProfilePicture: fallback?.profileImageUrl,
  };
}

export function refId(ref?: UserRef | string | null) {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

export function profileUrl(id: string) {
  return `/profile/${id}`;
}

export function publicUrl(path: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://jobzinda.com";
  return origin + path;
}

/** Native share sheet when available, clipboard otherwise. Returns what happened. */
export async function shareLink(url: string, title?: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share) {
      await navigator.share({ url, title });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function whatsappLink(number?: string, text?: string) {
  const digits = (number || "").replace(/\D/g, "");
  const n = digits.length === 10 ? `91${digits}` : digits;
  const base = n ? `https://wa.me/${n}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const SUPPORT = {
  phone: "+919847561998",
  email: "jobzinda@gmail.com",
  whatsappDm: "https://wa.me/message/RYCPJ3DL5JQGO1",
  whatsappGroup: "https://chat.whatsapp.com/CziCbs0nTjYHXU9kMXhMrW",
  taskGroup: "https://chat.whatsapp.com/Kbd0WgKv5r9B2C4fpKpfyS",
  faq: "https://www.joraappfreelancers.com/faq",
  privacy: "https://www.joraappfreelancers.com/privacy-policy",
  playStore: "https://play.google.com/store/apps/details?id=com.jobZinda.customers",
};
