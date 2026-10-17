"use client";

import { useState, useSyncExternalStore } from "react";
import { playStoreLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

const DISMISS_KEY = "jz-app-banner-hidden-until";
const DISMISS_DAYS = 30;

function PlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 22" className={className} aria-hidden>
      <path fill="#4285f4" d="M1 1l10 10L1 21z" />
      <path fill="#34a853" d="M1 1l13 7.2L11 11z" />
      <path fill="#fbbc04" d="M14 8.2l5 2.8-5 2.8-3-2.8z" />
      <path fill="#ea4335" d="M1 21l10-10 3 2.8z" />
    </svg>
  );
}

/** Black "Get it on Google Play" badge. */
export function PlayBadge({ medium, className }: { medium: "banner" | "card"; className?: string }) {
  return (
    <a
      href={playStoreLink(medium)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl bg-[#111] py-1.5 pl-2.5 pr-3.5 text-white transition-transform hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
    >
      <PlayLogo className="h-5 w-5" />
      <span className="flex flex-col leading-none">
        <span className="text-[9px] font-medium uppercase tracking-wide text-white/80">Get it on</span>
        <span className="text-[15px] font-semibold">Google Play</span>
      </span>
    </a>
  );
}

/** Desktop home rail: desktops can't install the Android app, so lead with a QR code. */
export function GetAppCard() {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-surface-container-lowest p-4 shadow-sm">
      <img
        src="/images/app-qr.svg"
        alt="QR code to download the Job Zinda app"
        className="h-22 w-22 shrink-0 rounded-xl ring-1 ring-outline-variant/30"
      />
      <div className="min-w-0">
        <h3 className="font-bold leading-tight">Get the Job Zinda app</h3>
        <p className="mt-1 text-xs text-on-surface-variant">Scan with your phone, or</p>
        <PlayBadge medium="card" className="mt-2" />
      </div>
    </div>
  );
}

const noSubscribe = () => () => {};

function shouldOfferApp() {
  if (!/android/i.test(navigator.userAgent)) return false;
  try {
    return Number(localStorage.getItem(DISMISS_KEY) ?? 0) < Date.now();
  } catch {
    return true;
  }
}

/** Slim smart-app banner for Android phones; dismissing hides it for 30 days. */
export function AppBanner() {
  // Server render and non-Android browsers get nothing.
  const offer = useSyncExternalStore(noSubscribe, shouldOfferApp, () => false);
  const [closed, setClosed] = useState(false);
  if (!offer || closed) return null;

  const dismiss = () => {
    setClosed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
    } catch {
      // Private mode: it just shows again next visit.
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-primary/5 bg-surface-container-lowest py-2.5 pl-2 pr-4 md:hidden">
      <button onClick={dismiss} aria-label="Dismiss" className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container">
        <Icon name="close" className="text-lg" />
      </button>
      <img src="/logo.png" alt="" className="h-10 w-10 shrink-0 rounded-xl shadow-sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-on-surface">Job Zinda app</p>
        <p className="truncate text-xs text-on-surface-variant">Free on Google Play</p>
      </div>
      <a
        href={playStoreLink("banner")}
        target="_blank"
        rel="noreferrer"
        className="primary-gradient shrink-0 rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-primary/20"
      >
        Get
      </a>
    </div>
  );
}
