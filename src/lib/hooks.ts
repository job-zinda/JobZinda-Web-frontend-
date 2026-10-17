"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import type { Paged } from "./types";

export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Infinite list over the backend's pageNumber/hasNext pagination. */
export function usePaged<T>(
  key: QueryKey,
  fetchPage: (pageNumber: number) => Promise<Paged<T>>,
  options: { enabled?: boolean; refetchInterval?: number } = {},
) {
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.hasNext ? all.length + 1 : undefined),
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  return { ...query, items };
}

/** Calls onVisible when the returned ref's element scrolls into view. */
export function useInView<T extends Element>(onVisible: () => void, active = true) {
  const ref = useRef<T | null>(null);
  const cb = useRef(onVisible);
  useEffect(() => {
    cb.current = onVisible;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const obs = new IntersectionObserver((entries) => entries[0]?.isIntersecting && cb.current(), {
      rootMargin: "400px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);
  return ref;
}

/** Browser geolocation, falling back to the centre of India (as the Flutter app does). */
export const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

export function getPosition(): Promise<{ lat: number; lng: number; fallback: boolean }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ...INDIA_CENTER, fallback: true });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, fallback: false }),
      () => resolve({ ...INDIA_CENTER, fallback: true }),
      { timeout: 8000, maximumAge: 600_000 },
    );
  });
}
