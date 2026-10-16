import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent", className)}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-9 w-9" />
    </div>
  );
}
