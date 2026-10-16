"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/client";
import { ToastProvider } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

function LoginRequiredDialog() {
  const { loginPrompt, closeLoginPrompt } = useAuth();
  return (
    <Dialog open={!!loginPrompt} onClose={closeLoginPrompt}>
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="primary-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/30">
          <Icon name="lock" className="text-3xl" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Login required</h2>
          <p className="mt-1.5 text-sm text-on-surface-variant">{loginPrompt}</p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Link
            href="/login"
            onClick={closeLoginPrompt}
            className="primary-gradient flex h-11 items-center justify-center rounded-xl text-sm font-bold text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={closeLoginPrompt}
            className="flex h-11 items-center justify-center rounded-xl bg-secondary-container text-sm font-bold text-on-secondary-container"
          >
            Create an account
          </Link>
        </div>
      </div>
    </Dialog>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          {children}
          <LoginRequiredDialog />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
