"use client";

import { cn } from "@/lib/utils";

/** Pill-style segmented tabs. */
export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; badge?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-surface-container p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all",
            value === o.value
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {o.label}
          {!!o.badge && (
            <span className="min-w-5 rounded-full bg-primary px-1.5 text-[10px] leading-5 text-white">{o.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Horizontally scrolling filter chips. */
export function Chips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            value === o.value
              ? "primary-gradient text-white shadow-md shadow-primary/20"
              : "bg-surface-container-lowest text-on-surface-variant ring-1 ring-outline-variant/30 hover:text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
