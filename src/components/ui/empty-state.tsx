import type { ReactNode } from "react";
import { Icon } from "./icon";

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-container-lowest px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-container text-primary">
        <Icon name={icon} className="text-3xl" />
      </div>
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      {description && <p className="max-w-sm text-sm text-on-surface-variant">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <EmptyState
      icon="error"
      title="Couldn't load this"
      description={message}
      action={
        onRetry && (
          <button onClick={onRetry} className="text-sm font-bold text-primary hover:underline">
            Try again
          </button>
        )
      }
    />
  );
}
