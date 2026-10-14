import { cn } from "@/lib/utils";

/** Material Symbols Outlined glyph (font loaded in the root layout). */
export function Icon({ name, filled, className }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("material-symbols-outlined leading-none", filled && "filled", className)}>
      {name}
    </span>
  );
}
