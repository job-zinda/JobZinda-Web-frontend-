"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/utils";

function useBannerTap() {
  const router = useRouter();
  return (b: Banner) => {
    const action = (b.bannerOnTapAction || "").toLowerCase();
    if (action === "subscription") router.push("/plans");
    else if (b.linkDirection?.startsWith("http")) window.open(b.linkDirection, "_blank", "noopener");
  };
}

function bannerSrc(b: Banner) {
  return b.bannerImageUrl || b.mediaUrl || "";
}

/** Auto-rotating carousel for "top" banners. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const items = banners.filter(bannerSrc);
  const [index, setIndex] = useState(0);
  const onTap = useBannerTap();

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const current = Math.min(index, items.length - 1);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface-container shadow-sm">
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((b) => (
          <button key={b._id} onClick={() => onTap(b)} className="aspect-[21/8] w-full shrink-0" aria-label={b.title || "Banner"}>
            <img src={bannerSrc(b)} alt={b.title || ""} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((b, i) => (
            <button
              key={b._id}
              onClick={() => setIndex(i)}
              aria-label={`Banner ${i + 1}`}
              className={cn("h-1.5 rounded-full bg-white transition-all", i === current ? "w-6" : "w-1.5 opacity-60")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** A single inline banner, interleaved between posts. */
export function InlineBanner({ banner }: { banner: Banner }) {
  const onTap = useBannerTap();
  if (!bannerSrc(banner)) return null;
  return (
    <button onClick={() => onTap(banner)} className="block w-full overflow-hidden rounded-3xl shadow-sm" aria-label={banner.title || "Banner"}>
      <img src={bannerSrc(banner)} alt={banner.title || ""} className="aspect-[21/9] w-full object-cover" />
    </button>
  );
}
