import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const SIZES = { xs: "h-7 w-7 text-[10px]", sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg", xl: "h-28 w-28 text-3xl" };

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-secondary-container font-bold text-primary flex items-center justify-center",
        SIZES[size],
        className,
      )}
    >
      {src ? <img src={src} alt={name || ""} className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}
