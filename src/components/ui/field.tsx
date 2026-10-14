import type { ReactNode } from "react";

/** Label + control + optional hint/error, used by every form. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-error">{error}</p>
      ) : (
        hint && <p className="text-xs text-on-surface-variant/80">{hint}</p>
      )}
    </div>
  );
}
