"use client";

import { useEffect, useState } from "react";
import { searchPlaces, type Place } from "@/lib/geo";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Debounced location autocomplete (India). */
export function PlaceSearch({
  onPick,
  placeholder = "Search a city or area",
  className,
  initial = "",
}: {
  onPick: (p: Place) => void;
  placeholder?: string;
  className?: string;
  initial?: string;
}) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || q.trim().length < 3) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchPlaces(q, ctrl.signal));
      } catch {
        // aborted
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  return (
    <div className={cn("relative", className)}>
      <Icon name="location_on" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl bg-surface-container-lowest pl-11 pr-10 text-sm shadow-sm outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/30"
      />
      {loading && <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
      {open && results.length > 0 && q.trim().length >= 3 && (
        <ul className="absolute z-[1000] mt-2 max-h-72 w-full overflow-y-auto rounded-2xl bg-surface-container-lowest py-1 shadow-xl ring-1 ring-outline-variant/20">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(r);
                  setQ(r.label.split(",").slice(0, 2).join(","));
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-surface-container-low"
              >
                <Icon name="place" className="mt-0.5 text-lg text-on-surface-variant" />
                <span className="line-clamp-2">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
