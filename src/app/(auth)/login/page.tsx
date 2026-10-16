"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { errorMessage } from "@/components/ui/toast";
import { SUPPORT } from "@/lib/format";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Same rules as UsernameLoginScreen in the Flutter app.
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username.trim())) {
      setError("Username must be 3–30 characters: letters, numbers, dot, dash or underscore.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-on-surface-variant">Sign in with your username and password.</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <Field label="Username" htmlFor="username">
          <Input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your.username"
            autoFocus
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
            >
              <Icon name={show ? "visibility_off" : "visibility"} className="text-xl" />
            </button>
          </div>
        </Field>

        <div className="-mt-2 text-right">
          {/* The Flutter app routes "forgot password" to WhatsApp support too. */}
          <a
            href={`https://wa.me/${SUPPORT.phone.replace("+", "")}?text=${encodeURIComponent("Hi, I forgot my Job Zinda password.")}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-error/8 px-4 py-3 text-sm font-medium text-error">
            <Icon name="error" className="text-lg" />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-outline">
        <span className="h-px flex-1 bg-outline-variant/40" />
        or
        <span className="h-px flex-1 bg-outline-variant/40" />
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={`/login/email${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-lowest text-sm font-bold hover:bg-surface-container-low"
        >
          <Icon name="mail" className="text-xl text-primary" />
          Continue with email
        </Link>
        <Link href="/" className="text-center text-sm font-semibold text-on-surface-variant hover:text-primary">
          Continue as guest
        </Link>
      </div>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        New to Job Zinda?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
